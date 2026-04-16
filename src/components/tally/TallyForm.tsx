import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface TallyField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'autocomplete';
  options?: string[];
  required?: boolean;
  defaultValue?: string | number;
  width?: string;
}

interface TallyFormProps {
  title: string;
  fields: TallyField[];
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  initialValues?: Record<string, any>;
  submitLabel?: string;
}

const TallyForm: React.FC<TallyFormProps> = ({
  title, fields, onSubmit, onCancel, initialValues = {}, submitLabel = 'Accept? Yes or No',
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach(f => { v[f.key] = initialValues[f.key] ?? f.defaultValue ?? ''; });
    return v;
  });
  const [activeField, setActiveField] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState('');
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[activeField]?.focus();
  }, [activeField]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showConfirm) { setShowConfirm(false); return; }
      if (autocompleteOpen) { setAutocompleteOpen(false); return; }
      onCancel();
      return;
    }

    if (showConfirm) {
      if (e.key === 'y' || e.key === 'Y' || (e.ctrlKey && e.key === 'a')) {
        e.preventDefault();
        onSubmit(values);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowConfirm(false);
      }
      return;
    }

    const field = fields[activeField];

    // Handle autocomplete navigation
    if (autocompleteOpen && field?.type === 'autocomplete') {
      const filtered = (field.options || []).filter(o =>
        o.toLowerCase().includes(autocompleteFilter.toLowerCase())
      );
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndex(i => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[autocompleteIndex]) {
          setValues(v => ({ ...v, [field.key]: filtered[autocompleteIndex] }));
        }
        setAutocompleteOpen(false);
        moveToNext();
        return;
      }
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (activeField < fields.length - 1) {
        moveToNext();
      } else {
        setShowConfirm(true);
      }
    }
  }, [activeField, fields, values, showConfirm, autocompleteOpen, autocompleteFilter, autocompleteIndex, onCancel, onSubmit]);

  const moveToNext = () => {
    const next = activeField + 1;
    if (next < fields.length) {
      setActiveField(next);
      setAutocompleteOpen(false);
      setAutocompleteFilter('');
      setAutocompleteIndex(0);
    }
  };

  const handleChange = (key: string, val: any, field: TallyField) => {
    setValues(v => ({ ...v, [key]: val }));
    if (field.type === 'autocomplete') {
      setAutocompleteFilter(val);
      setAutocompleteOpen(true);
      setAutocompleteIndex(0);
    }
  };

  const currentField = fields[activeField];

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      <div className="text-center font-bold text-[#ffeb3b] py-2 text-sm border-b border-[#4a6fa5]">
        {title}
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {fields.map((field, idx) => (
          <div key={field.key} className={`flex items-center mb-1 text-xs ${idx === activeField ? 'bg-[#2a4a7a]' : ''}`}>
            <label className="w-48 text-right pr-4 text-[#aaa] shrink-0">
              {field.label}
              {field.required && <span className="text-[#ffeb3b]"> *</span>}
            </label>
            <div className="flex-1 relative" style={{ maxWidth: field.width || '300px' }}>
              {field.type === 'select' ? (
                <select
                  ref={el => { inputRefs.current[idx] = el; }}
                  className="w-full bg-[#1a3a5c] border-b border-[#4a6fa5] text-[#e0e0e0] px-1 py-0.5 outline-none font-mono text-xs focus:border-[#ffeb3b]"
                  value={values[field.key]}
                  onChange={e => handleChange(field.key, e.target.value, field)}
                  onFocus={() => setActiveField(idx)}
                >
                  <option value="">-- Select --</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <>
                  <input
                    ref={el => { inputRefs.current[idx] = el; }}
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="w-full bg-[#1a3a5c] border-b border-[#4a6fa5] text-[#e0e0e0] px-1 py-0.5 outline-none font-mono text-xs focus:border-[#ffeb3b]"
                    value={values[field.key]}
                    onChange={e => handleChange(field.key, e.target.value, field)}
                    onFocus={() => {
                      setActiveField(idx);
                      if (field.type === 'autocomplete') {
                        setAutocompleteOpen(true);
                        setAutocompleteFilter(String(values[field.key] || ''));
                      }
                    }}
                  />
                  {field.type === 'autocomplete' && autocompleteOpen && idx === activeField && (
                    <div className="absolute z-50 top-full left-0 w-full max-h-32 overflow-auto bg-[#0d2340] border border-[#4a6fa5]">
                      {(field.options || [])
                        .filter(o => o.toLowerCase().includes(autocompleteFilter.toLowerCase()))
                        .map((o, oi) => (
                          <div
                            key={o}
                            className={`px-2 py-0.5 text-xs cursor-pointer ${oi === autocompleteIndex ? 'bg-[#4a6fa5] text-white' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'}`}
                            onClick={() => {
                              setValues(v => ({ ...v, [field.key]: o }));
                              setAutocompleteOpen(false);
                              moveToNext();
                            }}
                          >
                            {o}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
              <span className="text-[#666] text-[10px] ml-2">
                {values[field.key] ? '' : field.type === 'autocomplete' ? '(type to search)' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showConfirm && (
        <div className="border-t border-[#4a6fa5] p-2 text-center text-xs bg-[#0d2340]">
          <span className="text-[#ffeb3b]">{submitLabel}</span>
          <span className="text-[#aaa] ml-4">(Y/N or Ctrl+A to accept, Esc to edit)</span>
        </div>
      )}
    </div>
  );
};

export default TallyForm;
