// import "./styles.css";
import React, { useState, useCallback, useRef, useEffect } from 'react';

type NodeType = 'file' | 'folder';

interface FileNode {
  id: string;
  title: string;
  type: NodeType;
  parentId: string | null;
  childIds: string[];
  isOpen?: boolean;
}

interface TreeState {
  [id: string]: FileNode;
}

const generateData = (): TreeState => {
  const nodes: TreeState = {
    root: {
      id: 'root',
      title: 'enterprise-platform',
      type: 'folder',
      parentId: null,
      childIds: [],
      isOpen: true,
    },
  };

  // --- 1. RAMAS PROFUNDAS (5 niveles) ---
  ['deep-alpha', 'deep-omega'].forEach((id) => {
    nodes['root'].childIds.push(id);
    nodes[id] = {
      id,
      title: `${id.toUpperCase()}`,
      type: 'folder',
      parentId: 'root',
      childIds: [`${id}-l2`],
      isOpen: false,
    };

    for (let i = 2; i <= 5; i++) {
      const currId = `${id}-l${i}`;
      const nextId = `${id}-l${i + 1}`;
      nodes[currId] = {
        id: currId,
        title: i === 50 ? `final-service-v${i}.ts` : `level-${i}-container`,
        type: i === 50 ? 'file' : 'folder',
        parentId: `${id}-l${i - 1}`,
        childIds: i < 5 ? [nextId] : [],
        isOpen: false,
      };
    }
  });

  // --- 2. RAMAS ESTÁNDAR (3 niveles) ---
  for (let i = 1; i <= 1000; i++) {
    const sectionId = `section-${i}`;
    nodes['root'].childIds.push(sectionId);
    nodes[sectionId] = {
      id: sectionId,
      title: `Module-${i}`,
      type: 'folder',
      parentId: 'root',
      childIds: [],
      isOpen: false,
    };

    for (let j = 1; j <= 25; j++) {
      const subId = `${sectionId}-sub-${j}`;
      nodes[sectionId].childIds.push(subId);
      nodes[subId] = {
        id: subId,
        title: `feature-set-${j}`,
        type: 'folder',
        parentId: sectionId,
        childIds: [],
        isOpen: false,
      };

      // Archivos finales (Nivel 3)
      for (let k = 1; k <= 15; k++) {
        const fileId = `${subId}-file-${k}`;
        nodes[subId].childIds.push(fileId);
        nodes[fileId] = {
          id: fileId,
          title: `component-logic-${k}.tsx`,
          type: 'file',
          parentId: subId,
          childIds: [],
        };
      }
    }
  }

  return nodes;
};

const INITIAL_DATA = generateData();
// desde aca

interface NodeProps {
  id: string;
  nodes: TreeState;
  onToggle: (id: string) => void;
  level: number;
}

const NodeLag: React.FC<NodeProps> = React.memo(
  ({ id, nodes, onToggle, level }) => {
    const node = nodes[id];

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.type === 'folder') onToggle(id);
    };

    return (
      <div style={{ userSelect: 'none' }}>
        <div
          onClick={handleToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: `${level * 20 + 8}px`,
            cursor: node.type === 'folder' ? 'pointer' : 'default',
            backgroundColor: 'transparent',
            transition: 'background 0.2s',
            borderRadius: '4px',
            fontSize: '14px',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#37373d')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'transparent')
          }
        >
          <span
            style={{
              marginRight: '8px',
              width: '16px',
              display: 'inline-block',
            }}
          >
            {node.type === 'folder' ? (node.isOpen ? '▼' : '▶') : ''}
          </span>
          <span style={{ marginRight: '8px' }}>
            {node.type === 'folder' ? (node.isOpen ? '📂' : '📁') : '📄'}
          </span>
          <span style={{ color: node.type === 'folder' ? '#e1e1e1' : '#ccc' }}>
            {node.title}
          </span>
        </div>

        {node.type === 'folder' && node.isOpen && (
          <div>
            {node.childIds.map((childId) => (
              <NodeLag
                key={childId}
                id={childId}
                nodes={nodes}
                onToggle={onToggle}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

const Node: React.FC<NodeProps> = React.memo(
  ({ id, nodes, onToggle, level }) => {
    const node = nodes[id];
    const [isNearScreen, setIsNearScreen] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);

    // Intersection Observer para evitar renderizar hijos de carpetas que no se ven
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Marcamos como visible si está en el viewport (o cerca)
          if (entry.isIntersecting) {
            setIsNearScreen(true);
            // Una vez que lo vemos, podemos dejar de observar si queremos (opcional)
            // observer.unobserve(entry.target);
          } else {
            setIsNearScreen(false);
          }
        },
        { rootMargin: '200px' }, // Margen de 200px para que cargue un poco antes de llegar
      );

      if (nodeRef.current) observer.observe(nodeRef.current);
      return () => observer.disconnect();
    }, []);

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.type === 'folder') onToggle(id);
    };

    return (
      <div
        ref={nodeRef}
        style={{ minHeight: '28px' }}
      >
        {/* Solo renderizamos el contenido real si está cerca de la pantalla */}
        {isNearScreen ? (
          <>
            <div
              onClick={handleToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                paddingLeft: `${level * 20 + 8}px`,
                cursor: node.type === 'folder' ? 'pointer' : 'default',
                backgroundColor: 'transparent',
                fontSize: '14px',
              }}
            >
              <span style={{ marginRight: '8px', width: '16px' }}>
                {node.type === 'folder' ? (node.isOpen ? '▼' : '▶') : ''}
              </span>
              <span style={{ marginRight: '8px' }}>
                {node.type === 'folder' ? (node.isOpen ? '📂' : '📁') : '📄'}
              </span>
              <span
                style={{ color: node.type === 'folder' ? '#e1e1e1' : '#ccc' }}
              >
                {node.title}
              </span>
            </div>

            {node.type === 'folder' && node.isOpen && (
              <div>
                {node.childIds.map((childId) => (
                  <Node
                    key={childId}
                    id={childId}
                    nodes={nodes}
                    onToggle={onToggle}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Placeholder invisible para mantener el tamaño del scrollbar */
          <div style={{ height: '28px', marginLeft: `${level * 20 + 8}px` }} />
        )}
      </div>
    );
  },
);

export function FileExplorer() {
  const [nodes, setNodes] = useState<TreeState>(INITIAL_DATA);

  const toggleNode = useCallback((id: string) => {
    setNodes((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen },
    }));
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#1e1e1e',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          color: '#888',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        Explorer: Optimized Tree
      </h2>
      <div
        style={{
          maxWidth: '400px',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '10px 0',
        }}
      >
        {/* change this */}
        <NodeLag
          id='root'
          nodes={nodes}
          onToggle={toggleNode}
          level={0}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className='App'>
      <FileExplorer />
    </div>
  );
}
