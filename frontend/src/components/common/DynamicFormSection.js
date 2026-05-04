import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DynamicField from './DynamicField';
import { useLanguage } from '../../context/Languagecontext';

export default function DynamicFormSection({ formType, eventId, step, values, onChange, errors }) {
  const [fields, setFields] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    const url = eventId
      ? `/api/form-fields/${formType}?eventId=${eventId}`
      : `/api/form-fields/${formType}`;

    axiosInstance.get(url).then(r => {
      let allFields = r.data.fields || [];
      if (step !== undefined && step !== null) {
        allFields = allFields.filter(f => !f.showOnStep || f.showOnStep === step);
      }
      setFields(allFields);
    }).catch(() => {});
  }, [formType, eventId, step]);

  if (fields.length === 0) return null;

  const fieldsBySection = {};
  const unsectioned = [];
  fields.forEach(field => {
    if (field.section) {
      if (!fieldsBySection[field.section]) fieldsBySection[field.section] = [];
      fieldsBySection[field.section].push(field);
    } else {
      unsectioned.push(field);
    }
  });
  const sections = Object.keys(fieldsBySection);

  return (
    <div>
      {unsectioned.map(field => (
        <DynamicField
          key={field.fieldName}
          field={field}
          value={values[field.fieldName]}
          onChange={onChange}
          error={errors?.[field.fieldName]}
          language={language}
        />
      ))}

      {sections.map(section => {
        const sectionLabel = language === 'si'
          ? fieldsBySection[section][0]?.sectionSinhala || section
          : section;

        return (
          <div key={section} style={{ marginBottom: 20 }}>
            <div style={{
              background: '#f1f5f9',
              padding: '8px 14px',
              borderLeft: '3px solid var(--primary)',
              marginBottom: 14,
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--primary)',
            }}>
              {sectionLabel}
            </div>
            {fieldsBySection[section].map(field => (
              <DynamicField
                key={field.fieldName}
                field={field}
                value={values[field.fieldName]}
                onChange={onChange}
                error={errors?.[field.fieldName]}
                language={language}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
