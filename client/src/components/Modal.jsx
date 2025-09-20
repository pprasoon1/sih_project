// import React from 'react';
// import ReactDOM from 'react-dom';
// import './Modal.css';

// const Modal = ({ isOpen, onClose, children }) => {
//     if (!isOpen) return null;

//     // This is the portal: it renders the modal content into the '#modal-root' div
//     return ReactDOM.createPortal(
//         <>
//             <div className="modal-overlay" onClick={onClose} />
//             <div className="modal-content">
//                 {children}
//             </div>
//         </>,
//         document.getElementById('modal-root')
//     );
// };

// export default Modal;

import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">&times;</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;