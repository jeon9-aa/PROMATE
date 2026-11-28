import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore.js";
import logoIcon from "../../assets/logoIcon.svg";
import FormActions from "./components/FormActions.jsx";
import ProjectDescriptionField from "./components/ProjectDescriptionField.jsx";
import ProjectNameField from "./components/ProjectNameField.jsx";
import ProjectPeriodField from "./components/ProjectPeriodField.jsx";
import apiClient from "../../api/apiClient.js";
import Tag from "../../components/Tag/Tag.jsx";
import "./TeamCreatePage.css";

const domainOptions = [
  { id: "PROJECT", label: "조별과제" },
  { id: "STUDY", label: "스터디" },
  { id: "CONTEST", label: "공모전" },
  { id: "DEV", label: "개발" },
  { id: "ETC", label: "기타" },
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    reader.readAsDataURL(file);
  });

const getTodayValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;

  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

function TeamCreatePage() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const hasShownLoginAlert = useRef(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const token = localStorage.getItem("accessToken")?.trim();
  const canAccess = isLoggedIn && !!token && token !== "null" && token !== "undefined";

  useEffect(() => {
    if (canAccess || hasShownLoginAlert.current) return;

    hasShownLoginAlert.current = true;
    alert("로그인 후 이용 가능합니다.");
    navigate(-1);
  }, [canAccess, navigate]);

  const todayValue = getTodayValue();
  const [projectName, setProjectName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("PROJECT");
  const [recruitCount, setRecruitCount] = useState("");
  const [startDate, setStartDate] = useState(todayValue);
  const [endDate, setEndDate] = useState(todayValue);
  const [description, setDescription] = useState("");
  const [recruitImageUrl, setRecruitImageUrl] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const isRecruitCountValid = Number.isInteger(Number(recruitCount)) && Number(recruitCount) >= 1 && Number(recruitCount) <= 99;
  const isSubmitEnabled = !isCreated;

  const handleCancel = () => {
    setProjectName("");
    setSelectedDomain("PROJECT");
    setRecruitCount("");
    setStartDate(todayValue);
    setEndDate(todayValue);
    setDescription("");
    setRecruitImageUrl("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleResetImage = () => {
    setRecruitImageUrl("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("사진 용량이 10MB를 초과했습니다. 10MB 이하의 이미지를 선택해주세요.");
      event.target.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("JPG, PNG, WEBP 형식의 이미지만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setIsImageLoading(true);
    try {
      setRecruitImageUrl(await readFileAsDataUrl(file));
    } catch (error) {
      console.error("프로젝트 이미지 미리보기 실패:", error);
      alert("이미지를 불러오지 못했습니다. 다시 선택해주세요.");
      event.target.value = "";
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);

    if (endDate < value) {
      setEndDate(value);
    }
  };

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return;

    const warnings = [];
    if (!projectName.trim()) warnings.push("프로젝트 이름을 입력해주세요.");
    if (!description.trim()) warnings.push("프로젝트 설명을 입력해주세요.");
    if (!isRecruitCountValid) warnings.push("모집 인원을 1~99명 사이의 정수로 입력해주세요.");
    if (!startDate || !endDate) {
      warnings.push("프로젝트 시작일과 종료일을 선택해주세요.");
    } else {
      if (startDate < getTodayValue()) warnings.push("프로젝트 시작일은 오늘 이후로 선택해주세요.");
      if (endDate < startDate) warnings.push("프로젝트 종료일은 시작일 이후로 선택해주세요.");
    }
    if (isImageLoading) warnings.push("사진을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    if (warnings.length) {
      alert(warnings.join("\n"));
      return;
    }

    try {
      const payload = {
        title: projectName,
        description: description,
        category: selectedDomain,
        totalSlots: Number(recruitCount),
        startDate: startDate,
        endDate: endDate,
        recruitImageUrl: recruitImageUrl || null,
      };

      const response = await apiClient.post("/recruitments", payload);
      if (response.data && response.data.isSuccess) {
        setIsCreated(true);
        alert("팀 모집 게시글 발행을 성공했습니다.");
        navigate(-1);
      } else {
        alert(response.data?.message || "팀 생성 결과를 확인하지 못했습니다. 목록에서 생성 여부를 확인해주세요.");
      }
    } catch (error) {
      console.error("팀 모집 게시글 생성 실패:", error);
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;
      const statusMessages = {
        400: "입력한 정보를 확인해주세요.",
        401: "로그인이 만료되었습니다. 다시 로그인해주세요.",
        403: "팀을 생성할 권한이 없습니다.",
        409: "현재 상태에서는 팀을 생성할 수 없습니다. 기존 모집글을 확인해주세요.",
        413: "서버에서 허용하는 요청 용량을 초과했습니다. 사진 용량을 줄이거나 제거해주세요.",
        429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      };
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        alert("서버 응답 시간이 초과되었습니다. 목록에서 생성 여부를 확인한 뒤 다시 시도해주세요.");
      } else if (error.request && !error.response) {
        alert("서버에 연결하지 못했습니다. 인터넷 연결과 목록의 생성 여부를 확인한 뒤 다시 시도해주세요.");
      } else {
        alert(typeof serverMessage === "string" && serverMessage.trim()
          ? serverMessage
          : statusMessages[status] || "팀 생성 중 서버 오류가 발생했습니다. 잠시 후 목록에서 생성 여부를 확인해주세요.");
      }
    }
  };

  if (!canAccess) return null;

  return (
    <div className="teammaking-page">
      <h1 className="teammaking-page-title">프로젝트 생성</h1>
      <div className="card">
        <div className="teammaking-image-field">
          <GuardedButton
            type="button"
            className={`teammaking-logo-box${recruitImageUrl ? " has-image" : ""}`}
            onClick={() => imageInputRef.current?.click()}
            aria-label={recruitImageUrl ? "프로젝트 이미지 변경" : "프로젝트 이미지 설정"}
            title={recruitImageUrl ? "프로젝트 이미지 변경" : "프로젝트 이미지 설정"}
          >
            <img
              src={recruitImageUrl || logoIcon}
              alt={recruitImageUrl ? "선택한 프로젝트 이미지 미리보기" : ""}
            />
            <span className="teammaking-logo-edit" aria-hidden="true">+</span>
          </GuardedButton>
          {recruitImageUrl && (
            <GuardedButton
              type="button"
              className="teammaking-image-reset"
              onClick={handleResetImage}
            >
              기본 이미지로 변경
            </GuardedButton>
          )}
          <input
            ref={imageInputRef}
            className="teammaking-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </div>
        <ProjectNameField
          projectName={projectName}
          onProjectNameChange={setProjectName}
        />
        <div className="form-field">
          <span className="teammaking-form-label">카테고리</span>
          <div className="domain-tags">
            {domainOptions.map((option) => (
              <Tag
                key={option.id}
                isActive={selectedDomain === option.id}
                onClick={() => setSelectedDomain(option.id)}
              >
                {option.label}
              </Tag>
            ))}
          </div>
        </div>
        <div className="form-field recruit-count-field">
          <div className="recruit-count-label-row">
            <label className="teammaking-form-label" htmlFor="recruit-count">
              모집 인원
            </label>
          </div>
          <input
            id="recruit-count"
            className="recruit-count-input"
            type="number"
            placeholder="1~99명"
            min="1"
            max="99"
            step="1"
            value={recruitCount}
            onChange={(event) => setRecruitCount(event.target.value)}
            aria-describedby="recruit-count-help"
            aria-invalid={!isRecruitCountValid}
          />
        </div>
        <ProjectPeriodField
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={setEndDate}
        />
        <ProjectDescriptionField
          description={description}
          onDescriptionChange={setDescription}
        />
        <FormActions
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isSubmitEnabled={isSubmitEnabled}
        />
      </div>
    </div>
  );
}

export default TeamCreatePage;
