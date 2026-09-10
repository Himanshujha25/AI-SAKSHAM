export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function errMsg(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback;
}
