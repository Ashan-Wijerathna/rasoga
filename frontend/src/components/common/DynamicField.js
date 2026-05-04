import React from 'react';

export default function DynamicField({ field, value, onChange, error, language }) {
  const label = language === 'si' && field.fieldLabelSinhala
    ? field.fieldLabelSinhala
    : field.fieldLabel;

  const placeholder = language === 'si' && field.placeholderSinhala
    ? field.placeholderSinhala
    : (field.placeholder || '');

  const helpText = language === 'si' && field.helpTextSinhala
    ? field.helpTextSinhala
    : field.helpText;

  const maxMB = field.validationRules?.fileMaxSizeMB || 5;

  const renderInput = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            className={`form-control${error ? ' error' : ''}`}
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <textarea
            className={`form-control${error ? ' error' : ''}`}
            rows={4}
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
            style={{ resize: 'none' }}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className={`form-control${error ? ' error' : ''}`}
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
          />
        );

      case 'tel':
        return (
          <input
            type="tel"
            className={`form-control${error ? ' error' : ''}`}
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={`form-control${error ? ' error' : ''}`}
            placeholder={placeholder}
            value={value || ''}
            min={field.validationRules?.min}
            max={field.validationRules?.max}
            onChange={e => onChange(field.fieldName, e.target.value)}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className={`form-control${error ? ' error' : ''}`}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            className={`form-control${error ? ' error' : ''}`}
            value={value || ''}
            onChange={e => onChange(field.fieldName, e.target.value)}
          >
            <option value="">— {placeholder || (language === 'si' ? 'තෝරන්න' : 'Select')} —</option>
            {(field.fieldOptions || []).map(opt => (
              <option key={opt.value} value={opt.value}>
                {language === 'si' && opt.labelSi ? opt.labelSi : opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            {(field.fieldOptions || []).map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  name={field.fieldName}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(field.fieldName, opt.value)}
                />
                {language === 'si' && opt.labelSi ? opt.labelSi : opt.label}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {(field.fieldOptions || []).map(opt => {
              const checked = Array.isArray(value) && value.includes(opt.value);
              return (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={checked}
                    onChange={e => {
                      const current = Array.isArray(value) ? value : [];
                      const updated = e.target.checked
                        ? [...current, opt.value]
                        : current.filter(v => v !== opt.value);
                      onChange(field.fieldName, updated);
                    }}
                  />
                  {language === 'si' && opt.labelSi ? opt.labelSi : opt.label}
                </label>
              );
            })}
          </div>
        );

      case 'file_image':
        return (
          <div
            style={{
              border: `2px dashed ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
              background: value ? '#f0f9ff' : 'var(--bg)',
            }}
            onClick={() => document.getElementById('file_' + field.fieldName).click()}
          >
            {value ? (
              <div>
                <img
                  src={URL.createObjectURL(value)}
                  alt="preview"
                  style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, marginBottom: 6, border: '1px solid var(--border)' }}
                />
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Uploaded</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {language === 'si' ? 'ඡායාරූපය උඩුගත කරන්න' : 'Click to upload image'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  JPG, PNG · Max {maxMB}MB
                </div>
              </div>
            )}
            <input
              id={'file_' + field.fieldName}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={e => onChange(field.fieldName, e.target.files[0] || null)}
            />
          </div>
        );

      case 'file_pdf':
        return (
          <div
            style={{
              border: `2px dashed ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
              background: value ? '#f0fdf4' : 'var(--bg)',
            }}
            onClick={() => document.getElementById('file_' + field.fieldName).click()}
          >
            {value ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Uploaded</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {value.name?.substring(0, 24)}{value.name?.length > 24 ? '...' : ''}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📑</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {language === 'si' ? 'PDF ගොනුව උඩුගත කරන්න' : 'Click to upload PDF'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  PDF only · Max {maxMB}MB
                </div>
              </div>
            )}
            <input
              id={'file_' + field.fieldName}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={e => onChange(field.fieldName, e.target.files[0] || null)}
            />
          </div>
        );

      case 'file_any':
        return (
          <div
            style={{
              border: `2px dashed ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
              background: value ? '#fefce8' : 'var(--bg)',
            }}
            onClick={() => document.getElementById('file_' + field.fieldName).click()}
          >
            {value ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📎</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Uploaded</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {value.name?.substring(0, 24)}{value.name?.length > 24 ? '...' : ''}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {language === 'si' ? 'ගොනුව උඩුගත කරන්න' : 'Click to upload file'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Max {maxMB}MB
                </div>
              </div>
            )}
            <input
              id={'file_' + field.fieldName}
              type="file"
              accept="*/*"
              style={{ display: 'none' }}
              onChange={e => onChange(field.fieldName, e.target.files[0] || null)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label">
        {label}
        {field.isRequired && <span style={{ color: 'red' }}> *</span>}
      </label>

      {renderInput()}

      {helpText && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
          {helpText}
        </p>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
