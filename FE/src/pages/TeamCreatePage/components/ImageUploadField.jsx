import { useRef } from "react";
import Avatar from "../../../components/Avatar/Avatar.jsx";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const imageIcon = (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function ImageUploadField({ imageSrc, onImageChange }) {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("사진 용량이 10MB를 초과했습니다. 10MB 이하의 이미지를 선택해주세요.");
      event.target.value = "";
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = ({ target }) => {
      onImageChange(target?.result ?? null);
    };
    fileReader.readAsDataURL(file);
  };

  return (
    <div className="image-upload-wrapper">
      <div
        className="image-upload-trigger"
        onClick={handleImageClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleImageClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="프로젝트 이미지 업로드"
      >
        <Avatar
          src={imageSrc}
          alt="프로젝트 이미지"
          size="lg"
          icon={imageIcon}
          className="image-upload-avatar"
        />
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default ImageUploadField;
