import ProfileAvatar from '../../../components/ProfileAvatar/ProfileAvatar';
import { formatMessageTime } from '../chatData';

export default function ChatMessage({ message, room }) {
  return (
    <div className={`chat-message${message.isMine ? ' chat-message--mine' : ''}`}>
      {!message.isMine && <ProfileAvatar src={message.senderProfileImageUrl ?? room.avatarUrl} alt={`${message.senderName ?? room.name} 프로필`} size={32} />}
      <p className="chat-message__bubble">{message.text}</p>
      <time dateTime={message.sentAt}>{formatMessageTime(message.sentAt)}</time>
    </div>
  );
}
