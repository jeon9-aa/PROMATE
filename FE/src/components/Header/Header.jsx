import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../../api/User/userProfileApi.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import logoImg from '../../assets/logoOrange.svg';
import profileIcon from '../../assets/icons/profileIcon.svg';
import profileIconHover from '../../assets/icons/profileOrangeIcon.svg';
import logoutIcon from '../../assets/icons/logout_black.svg';
import logoutIconHover from '../../assets/icons/logout_orange.svg';
import ProfileAvatar from '../ProfileAvatar/ProfileAvatar';
import './Header.css';

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [userData, setUserData] = useState({ userName: "...", profileImageUrl: null });

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        return;
      }

      try {
        const response = await getUserInfo();
        
        if (response?.isSuccess) {
          const userData = response.data;
          
          setUserData({
            userName: userData?.name || userData?.nickname || userData?.userName || "사용자",
            profileImageUrl: userData?.profileImageUrl || null
          });
        }
      } catch (error) {
        console.error("유저 정보 로드 실패", error);
      }
    };
    fetchUserData();

    window.addEventListener('userProfileUpdated', fetchUserData);
    return () => {
      window.removeEventListener('userProfileUpdated', fetchUserData);
    };
  }, [isLoggedIn]);

  return (
    <header className="header">
      <div className="header-left">
        <GuardedButton className="hamburger-btn" onClick={onMenuClick} aria-label="메뉴 열기">
          <span></span><span></span><span></span>
        </GuardedButton>
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="ProMate 로고" className="logo-image" />
            <span className="logo-text">PRO:MATE</span>
          </Link>
          <span className="logo-sub">최고의 팀을 꾸려, 협업하세요.</span>
        </div>
      </div>

      <div className="header-right">
        {isLoggedIn ? (
          <>
            <GuardedButton
              type="button"
              className="header-logout-btn"
              onClick={handleLogout}
              aria-label="로그아웃"
              data-tooltip="로그아웃"
            >
              <img src={logoutIcon} alt="" className="header-logout-icon default-icon" />
              <img src={logoutIconHover} alt="" className="header-logout-icon hover-icon" />
            </GuardedButton>
            <Link to="/profile" className="header-greeting">
              <strong>{userData.userName}</strong> 님 안녕하세요 :)
            </Link>
            <Link to="/profile">
              <ProfileAvatar src={userData.profileImageUrl} size="36px" />
            </Link>
          </>
        ) : (
          <Link to="/login" className="header-login-btn">
            <img src={profileIcon} alt="" className="header-login-icon default-icon" />
            <img src={profileIconHover} alt="" className="header-login-icon hover-icon" />
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;