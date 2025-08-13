import React from 'react';

export default function Inspector({ node, onUpdate, onRemove }) {
  
  if (!node) {
    return (
      <div className="panel">
        <div className="panel-title">Inspector</div>
        <div className="panel-body">
          <div className="muted">Select a component to edit its properties</div>
        </div>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdate({ props: { ...node.props, [key]: value } });
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove this ${node.type}?`)) {
      onRemove(node.id);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">Inspector - {node.type}</div>
      <div className="panel-body">
        <div className="inspector-section">
          <label>Type</label>
          <div className="chip">{node.type}</div>
        </div>

        {node.type === 'Button' && (
          <>
            <div className="inspector-section">
              <label>Text</label>
              <input
                type="text"
                value={node.props?.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Button text"
              />
            </div>
            <div className="inspector-section">
              <label>Variant</label>
              <select
                value={node.props?.variant || 'primary'}
                onChange={(e) => handleChange('variant', e.target.value)}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div className="inspector-section">
              <label>Button Background</label>
              <input
                type="color"
                value={node.props?.buttonBgColor || '#3b82f6'}
                onChange={(e) => onUpdate({ props: { ...node.props, buttonBgColor: e.target.value } })}
              />
            </div>
            <div className="inspector-section">
              <label>Button Text Color</label>
              <input
                type="color"
                value={node.props?.buttonTextColor || '#ffffff'}
                onChange={(e) => onUpdate({ props: { ...node.props, buttonTextColor: e.target.value } })}
              />
            </div>
          </>
        )}

        {node.type === 'Card' && (
          <>
            <div className="inspector-section">
              <label>Title</label>
              <input
                type="text"
                value={node.props?.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Card title"
              />
            </div>
            <div className="inspector-section">
              <label>Name</label>
              <input
                type="text"
                value={node.props?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Card name"
              />
            </div>
          </>
        )}

        {node.type === 'Form' && (
          <>
            <div className="inspector-section">
              <label>Name</label>
              <input
                type="text"
                value={node.props?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Form name"
              />
            </div>
            <div className="inspector-section">
              <label>Title</label>
              <input
                type="text"
                value={node.props?.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Form title"
              />
            </div>
            <div className="inspector-section">
              <label>Submit Label</label>
              <input
                type="text"
                value={node.props?.submitLabel || ''}
                onChange={(e) => handleChange('submitLabel', e.target.value)}
                placeholder="Submit button text"
              />
            </div>
          </>
        )}

        {node.type === 'Logo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="inspector-section">
              <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Display Type
              </label>
              <select 
                className="form-select"
                value={node.props?.displayType || 'text'} 
                onChange={(e) => onUpdate({ props: { ...node.props, displayType: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>
            
            {node.props?.displayType === 'image' ? (
              <div style={{ 
                background: 'rgba(96, 165, 250, 0.05)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid rgba(96, 165, 250, 0.2)'
              }}>
                <div className="inspector-section">
                  <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Image URL
                  </label>
                  <input 
                    className="form-input"
                    type="text" 
                    placeholder="Enter image URL or data URL"
                    value={node.props?.imageUrl || ''} 
                    onChange={(e) => onUpdate({ props: { ...node.props, imageUrl: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  />
                </div>
                
                <div className="inspector-section">
                  <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Alt Text
                  </label>
                  <input 
                    className="form-input"
                    type="text" 
                    placeholder="Enter alt text for accessibility"
                    value={node.props?.altText || ''} 
                    onChange={(e) => onUpdate({ props: { ...node.props, altText: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  />
                </div>
                
                {/* Image preview */}
                {node.props?.imageUrl && (
                  <div className="inspector-section">
                    <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                      Preview
                    </label>
                    <div style={{
                      width: '100%',
                      height: '80px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f9fafb',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={node.props.imageUrl} 
                        alt="Preview" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={() => (
                          <div style={{ color: '#ef4444', fontSize: '12px' }}>
                            Invalid image URL
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.05)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div className="inspector-section">
                  <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    Logo Text
                  </label>
                  <input 
                    className="form-input"
                    type="text" 
                    value={node.props?.text || 'LOGO'} 
                    onChange={(e) => onUpdate({ props: { ...node.props, text: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="inspector-section">
              <label style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Size
              </label>
              <select 
                className="form-select"
                value={node.props?.size || 'medium'} 
                onChange={(e) => onUpdate({ props: { ...node.props, size: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        )}

        {node.type === 'Label' && (
          <div className="inspector-section">
            <label>Text</label>
            <input
              type="text"
              value={node.props?.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Label text"
            />
          </div>
        )}

        {node.type === 'Input' && (
          <div className="inspector-section">
            <label>Placeholder</label>
            <input
              type="text"
              value={node.props?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              placeholder="Input placeholder"
            />
          </div>
        )}

        {node.type === 'PasswordInput' && (
          <div className="inspector-section">
            <label>Placeholder</label>
            <input
              type="text"
              value={node.props?.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              placeholder="Password placeholder"
            />
          </div>
        )}

        {/* Generic layout controls */}
        <div className="inspector-section">
          <label>Width (px)</label>
          <input
            type="number"
            value={typeof node.props?.width === 'number' ? node.props.width : ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val === '' ? undefined : Number(val);
              onUpdate({ props: { ...node.props, width: Number.isFinite(num) ? num : undefined } });
            }}
            placeholder="e.g., 360"
          />
        </div>

        <div className="inspector-section">
          <label>Height (px)</label>
          <input
            type="number"
            value={typeof node.props?.height === 'number' ? node.props.height : ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val === '' ? undefined : Number(val);
              onUpdate({ props: { ...node.props, height: Number.isFinite(num) ? num : undefined } });
            }}
            placeholder="e.g., 120"
          />
        </div>

        <div className="inspector-section">
          <label>Background Color</label>
          <input
            type="color"
            value={node.props?.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ props: { ...node.props, backgroundColor: e.target.value } })}
          />
        </div>

        <div className="inspector-section">
          <button
            className="btn btn-danger"
            onClick={handleRemove}
            style={{ width: '100%' }}
          >
            Remove {node.type}
          </button>
        </div>
      </div>
    </div>
  );
}
