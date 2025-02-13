// Project.jsx
import React from 'react';

const Project = ({ imageSrc, title, description }) => {
  return (
    <div className="project-frame">
      <img src={imageSrc} alt={title} className="project-image" />
      <div className="project-info">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Project;
