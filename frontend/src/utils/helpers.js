export const downloadBlob = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const formatDateLK = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-LK');
};
