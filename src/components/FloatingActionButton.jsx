import './FloatingActionButton.css';

export const FloatingActionButton = ({ onClick }) => {
  return (
    <button className="fab" onClick={onClick} title="Add note">
      <span className="fab-icon">+</span>
    </button>
  );
};
