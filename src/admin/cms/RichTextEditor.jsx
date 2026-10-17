import { useEffect, useRef } from 'react';
import './RichTextEditor.css';

const COMMANDS = [
  { cmd: 'bold', label: 'B', title: 'Жирный' },
  { cmd: 'italic', label: 'I', title: 'Курсив' },
  { cmd: 'underline', label: 'U', title: 'Подчёркнутый' },
  { cmd: 'insertUnorderedList', label: '• Список', title: 'Маркированный список' },
  { cmd: 'insertOrderedList', label: '1. Список', title: 'Нумерованный список' },
  { cmd: 'formatBlock', arg: 'h3', label: 'H3', title: 'Подзаголовок' },
  { cmd: 'formatBlock', arg: 'p', label: 'P', title: 'Абзац' },
  { cmd: 'removeFormat', label: 'Очистить', title: 'Убрать форматирование' },
];

const RichTextEditor = ({ label, value = '', onChange, rows = 8 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const run = (cmd, arg) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg || null);
    onChange?.(ref.current?.innerHTML || '');
  };

  return (
    <label className="cms-field rte-field">
      {label ? <span>{label}</span> : null}
      <div className="rte-toolbar">
        {COMMANDS.map((item) => (
          <button
            key={`${item.cmd}-${item.arg || item.label}`}
            type="button"
            className="rte-toolbar__btn"
            title={item.title}
            onMouseDown={(e) => {
              e.preventDefault();
              run(item.cmd, item.arg);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-editor"
        contentEditable
        role="textbox"
        aria-multiline="true"
        style={{ minHeight: `${Math.max(4, rows) * 22}px` }}
        onInput={() => onChange?.(ref.current?.innerHTML || '')}
        onBlur={() => onChange?.(ref.current?.innerHTML || '')}
      />
    </label>
  );
};

export default RichTextEditor;
