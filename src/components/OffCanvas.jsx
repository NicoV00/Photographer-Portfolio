import { useState } from 'react';

const OffCanvas = ({ name, ...props }) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
      <>
        <button style={{width:'100px', backgroundColor:"black"}} onClick={handleShow} className="me-2">
          {name}
        </button>
        {show && (
          <div style={styles.overlay}>
            <div style={styles.canvas}>
              <div style={styles.header}>
                <h2>Offcanvas</h2>
                <button onClick={handleClose} style={styles.closeButton}>X</button>
              </div>
              <div style={styles.body}>
                Some text as placeholder. In real life you can have the elements you
                have chosen. Like, text, images, lists, etc.
              </div>
            </div>
          </div>
        )}
      </>
    );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(1, 1, 1, 0.8)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  canvas: {
    width: '900px',
    height: '100%',
    color: 'white',
    backgroundColor: 'black',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  body: {
    marginTop: '20px',
  },
};

export default OffCanvas;
