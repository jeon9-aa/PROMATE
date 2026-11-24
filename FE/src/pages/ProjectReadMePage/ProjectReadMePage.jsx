import GuardedButton from '../../components/GuardedButton/GuardedButton.jsx';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import logoGray from '../../assets/icons/logoGW.svg';
import linkIcon from '../../assets/icons/linkIcon.svg';
import lockIcon from '../../assets/icons/lockIcon.svg';
import ProfileModal from '../../components/ProfileModal/ProfileModal';
import ApplyModal from '../../components/ApplyModal/ApplyModal';
import apiClient from '../../api/apiClient';
import { getOrCreateChatRoom } from '../../api/Recruits/recruitmentApi';
import Tag from '../../components/Tag/Tag';
import ShareLinkModal from './ShareLinkModal';
import PasswordInviteModal from './PasswordInviteModal';
import { createProjectInvite } from '../../api/Project/projectInviteApi';
import PasswordJoinNoticeModal from './PasswordJoinNoticeModal';
import './ProjectReadMePage.css';

const categories = [
  { id: "PROJECT", label: "조별과제" },
  { id: "STUDY", label: "스터디" },
  { id: "CONTEST", label: "공모전" },
  { id: "DEV", label: "개발" },
  { id: "ETC", label: "기타" },
];

function ProjectReadMePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams();

  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletablePostId, setDeletablePostId] = useState(null);
  const canDelete = projectData?.isAuthor && deletablePostId === postId;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordLinkModalOpen, setIsPasswordLinkModalOpen] = useState(false);
  const [isPasswordJoinNoticeOpen, setIsPasswordJoinNoticeOpen] = useState(false);
  const [passwordInvitations, setPasswordInvitations] = useState({});
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const inviteRequestPending = useRef(false);

  const handlePasswordInviteClick = () => {
    if (!projectData?.isAuthor) {
      setIsPasswordJoinNoticeOpen(true);
      return;
    }
    const invitation = passwordInvitations[postId];
    if (invitation && new Date(invitation.expiresAt).getTime() > Date.now()) {
      setIsPasswordLinkModalOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordRegister = async (password) => {
    if (inviteRequestPending.current || !projectData?.isAuthor || !/^[0-9]{4}$/.test(password)) return;
    if (projectData.projectId == null) {
      window.alert('프로젝트 ID를 확인할 수 없습니다. 다시 시도해 주세요.');
      return;
    }
    inviteRequestPending.current = true;
    setIsCreatingInvite(true);
    try {
      const invitation = await createProjectInvite(projectData.projectId, password);
      setPasswordInvitations((previous) => ({ ...previous, [postId]: invitation }));
      setIsPasswordModalOpen(false);
      setIsPasswordLinkModalOpen(true);
    } catch (error) {
      window.alert(error.message || '초대 링크 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      inviteRequestPending.current = false;
      setIsCreatingInvite(false);
    }
  };
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalPosition, setModalPosition] = useState(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJob, setApplyJob] = useState('');
  const [applyMotivation, setApplyMotivation] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [isCreatingChatRoom, setIsCreatingChatRoom] = useState(false);
  const chatRoomRequestPending = useRef(false);

  const handleChatClick = async () => {
    if (chatRoomRequestPending.current) return;
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'null' || token === 'undefined') {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    chatRoomRequestPending.current = true;
    setIsCreatingChatRoom(true);
    try {
      const { chatRoomId, chatPartnerName } = await getOrCreateChatRoom(postId);
      navigate(`/chat/${chatRoomId}`, {
        state: {
          createdRoom: {
            id: String(chatRoomId),
            projectName: projectData.title,
            name: chatPartnerName || projectData.author?.nickname || '팀장',
            avatarUrl: null,
            memberCount: 2,
            unread: 0,
            messages: [],
          },
        },
      });
    } catch (error) {
      alert(error.message || '채팅방 연결에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      chatRoomRequestPending.current = false;
      setIsCreatingChatRoom(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchProjectDetail = async () => {
      try {
        setIsLoading(true);
        setDeletablePostId(null);
        const response = await apiClient.get(`/recruitments/${postId}`);
        if (cancelled) return;
        if (response.data && response.data.isSuccess) {
          const data = response.data.data;
          setProjectData(data);
          setIsApplied(data.hasApplied);
          if (data.isAuthor) {
            try {
              const { data: projects } = await apiClient.get('/projects/me');
              if (!cancelled && projects?.isSuccess && Array.isArray(projects.data)) {
                const isActiveProject = projects.data.some((project) => (
                  String(project.recruitmentId) === String(postId)
                  || (data.projectId != null && String(project.projectId) === String(data.projectId))
                ));
                if (!isActiveProject && !['ACTIVE', 'COMPLETED'].includes(data.projectStatus)) {
                  setDeletablePostId(postId);
                }
              }
            } catch (error) {
              console.error('프로젝트 진행 상태 조회 실패:', error);
            }
          }
        }
      } catch (error) {
        if (cancelled) return;
        console.error('게시글 상세 정보 조회 실패:', error);
        alert(error.message || '해당 게시글을 찾을 수 없습니다.');
        navigate(-1, { replace: true });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (postId) fetchProjectDetail();
    else setIsLoading(false);
    return () => { cancelled = true; };
  }, [postId, navigate]);

  const handleMemberClick = async (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width
    });

    try {
      const response = await apiClient.get(`/recruitments/${postId}/leader-profile`);
      if (response.data && response.data.isSuccess) {
        setSelectedUser(response.data.data);
        setIsProfileModalOpen(true);
      }
    } catch (error) {
      console.error('팀장 프로필 조회 실패:', error);
      alert('팀장 프로필 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleApplyClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'null' || token === 'undefined') {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', {
        state: { returnTo: location.pathname + location.search + location.hash },
      });
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleCloseApplyModal = () => {
    setIsApplyModalOpen(false);
    setApplyJob('');
    setApplyMotivation('');
  };

  const handleSubmitApply = () => {
    console.log('지원 완료:', projectData.title, applyJob, applyMotivation);
    setIsApplied(true);
    handleCloseApplyModal();
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      try {
        const response = await apiClient.delete(`/recruitments/${postId}`);
        if (response.data && response.data.isSuccess) {
          alert(response.data.message || "성공적으로 삭제되었습니다.");
          navigate(-1, { replace: true });
        }
      } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert(error.message || "게시글 삭제에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return <main className="project-readme-page"><div style={{ padding: '40px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div></main>;
  }

  if (!projectData) {
    return <main className="project-readme-page"><div style={{ padding: '40px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div></main>;
  }

  return (
    <main className="project-readme-page">
      <div className="project-readme-banner">
        <div className="project-readme-banner-logo-wrapper">
          <img
            className='project-readme-banner-logo'
            src={projectData.recruitImageUrl || logoGray}
            alt={projectData.recruitImageUrl ? '프로젝트 이미지' : '프로젝트 로고'}
          />
        </div>
      </div>
      
      <div className="project-readme-info-section">
        <div className="project-readme-header-row">
          <h1 className="project-readme-title">{projectData.title}</h1>
          <div className="project-readme-date-container">
            {projectData.startDate && projectData.endDate && (
              <span className="project-readme-created-at">
                프로젝트 기간: {projectData.startDate} ~ {projectData.endDate}
              </span>
            )}
            <span className="project-readme-created-at">
              모집글 작성일: {projectData.createdAt?.split('T')[0]}
            </span>
          </div>
          <div className="project-readme-share-actions">
            <button type="button" className="project-readme-share-btn project-readme-link-btn"
              onClick={() => setIsShareModalOpen(true)} aria-haspopup="dialog">
              <img src={linkIcon} alt="" />
              링크 공유
            </button>
            <button type="button" className="project-readme-share-btn"
              onClick={handlePasswordInviteClick} aria-haspopup="dialog">
              <img src={lockIcon} alt="" />
              비밀번호 초대
            </button>
          </div>
        </div>

        <div className="project-readme-tags">
          {categories.map((category) => (
            <Tag
              key={category.id}
              isActive={projectData.category === category.id || projectData.category?.toUpperCase() === category.id}
              hideInactiveOnMobile={true}
            >
              {category.label}
            </Tag>
          ))}
        </div>

        <p className="project-readme-description">
          {projectData.content}
        </p>

        <hr className="project-readme-info-divider" />

        <div className="project-readme-team-section">
          <div className="project-readme-team-group">
            <div className="project-readme-team-role">팀장</div>
            <div 
              className="project-readme-team-member-name clickable" 
              onClick={handleMemberClick}
            >
              {projectData.author?.nickname || "알 수 없음"}
            </div>
          </div>
          <div className="project-readme-team-group">
            <div className="project-readme-team-role">팀원</div>
            <div className="project-readme-team-members-list">
              <span className="project-readme-team-member-name recruiting">
                {projectData.totalSlots || 0}명 모집중
              </span>
            </div>
          </div>
        </div>

        {projectData.isAuthor ? (
          canDelete && (
          <div className="project-readme-apply-container">
            <GuardedButton
              className="project-readme-delete-btn"
              onClick={handleDelete}
            >
              삭제
            </GuardedButton>
          </div>
          )
        ) : (
          <div className="project-readme-apply-container project-readme-participant-actions">
            {projectData.status === "RECRUITING" ? (
              <GuardedButton
                className={`project-readme-apply-btn ${isApplied ? 'reviewing' : 'apply'}`}
                onClick={() => !isApplied && handleApplyClick()}
                disabled={isApplied}
              >
                {isApplied ? '지원완료' : '지원하기'}
              </GuardedButton>
            ) : (
              <GuardedButton className="project-readme-apply-btn reviewing" disabled style={{ cursor: 'default' }}>
                모집완료
              </GuardedButton>
            )}
            <button type="button" className="project-readme-chat-btn"
              onClick={handleChatClick} disabled={isCreatingChatRoom} aria-busy={isCreatingChatRoom}>
              {isCreatingChatRoom ? '채팅방 연결 중...' : '팀장과 채팅하기'}
            </button>
          </div>
        )}
      </div>

      {isPasswordJoinNoticeOpen && !projectData.isAuthor && (
        <PasswordJoinNoticeModal
          onClose={() => setIsPasswordJoinNoticeOpen(false)}
        />
      )}

      {isPasswordModalOpen && projectData.isAuthor && (
        <PasswordInviteModal
          onClose={() => { if (!inviteRequestPending.current) setIsPasswordModalOpen(false); }}
          onSubmit={handlePasswordRegister}
          isSubmitting={isCreatingInvite}
        />
      )}

      {isPasswordLinkModalOpen && projectData.isAuthor && (
        <ShareLinkModal
          shareUrl={passwordInvitations[postId]?.inviteUrl}
          title="비밀번호 링크 공유"
          description="해당 링크에서 비밀번호를 입력한 참가자는 지원자 검토 없이 바로 프로젝트에 참여합니다."
          linkLabel="비밀번호 초대 링크"
          expiresAt={passwordInvitations[postId]?.expiresAt}
          onClose={() => setIsPasswordLinkModalOpen(false)}
        />
      )}

      {isShareModalOpen && (
        <ShareLinkModal
          shareUrl={`${window.location.origin}${location.pathname}`}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={selectedUser} 
        position={modalPosition}
      />

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={handleCloseApplyModal}
        onSubmit={handleSubmitApply}
        recruitmentId={postId}
        projectName={projectData.title}
        job={applyJob}
        motivation={applyMotivation}
        setJob={setApplyJob}
        setMotivation={setApplyMotivation}
      />
    </main>
  );
}

export default ProjectReadMePage;
