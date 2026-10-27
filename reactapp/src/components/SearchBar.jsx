import React from 'react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  style = {},
  disabled = false,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minWidth: '240px',
        flex: 1,
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '1rem',
          color: 'var(--text-dim)',
          pointerEvents: 'none',
          fontSize: '1rem',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Search"
        style={{
          paddingLeft: '2.6rem',
          paddingRight: value ? '2.4rem' : '1.1rem',
          height: '42px',
        }}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '0.8rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
