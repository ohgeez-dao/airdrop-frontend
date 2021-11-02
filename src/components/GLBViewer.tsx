import { useState } from "react";
import { GLTFModel, AmbientLight, DirectionLight } from "react-3d-viewer";

const GLBViewer = ({ url, width, height }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ width, height }}>
      <GLTFModel
        src={url}
        onLoad={() => setLoading(false)}
        width={loading ? 0 : width}
        height={loading ? 0 : height}
        rotation={{ x: -0.3, y: -0.7, z: 0.1 }}
        position={{ x: 0.2, y: -1.5, z: 1.3 }}
      >
        <AmbientLight color={0xffffff} />
        <DirectionLight
          color={0xffffff}
          position={{ x: 200, y: 200, z: 100 }}
        />
        <DirectionLight
          color={0xffffff}
          position={{ x: -200, y: 200, z: -100 }}
        />
      </GLTFModel>
      {loading && (
        <div className={"loading"}>
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default GLBViewer;
