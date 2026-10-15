export type RegistrationForm = { name: string; phone: string; email: string; roles: string[]; skills: string[]; message: string };
export type RegistrationErrors = Partial<Record<'name' | 'phone' | 'email' | 'roles' | 'message' | 'consent' | 'capacity', string>>;
export const emptyRegistration: RegistrationForm = { name: '', phone: '', email: '', roles: [], skills: [], message: '' };

export function validateContact(form: RegistrationForm): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 100) errors.name = 'Nhập họ tên từ 2 đến 100 ký tự.';
  const phone = form.phone.trim().replace(/[\s().-]/g, '').replace(/^\+84/, '0');
  if (!/^0[35789]\d{8}$/.test(phone)) errors.phone = 'Nhập số di động Việt Nam hợp lệ (10 số hoặc +84).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Nhập email hợp lệ.';
  return errors;
}
export function validateRegistration(form: RegistrationForm, consent: boolean, available: boolean): RegistrationErrors {
  return {
    ...validateContact(form),
    ...(form.roles.length ? {} : { roles: 'Chọn ít nhất một vai trò hoặc Không có ưu tiên.' }),
    ...(form.message.length <= 300 ? {} : { message: 'Lời nhắn tối đa 300 ký tự.' }),
    ...(consent ? {} : { consent: 'Vui lòng xác nhận thời gian và quy định trước khi đăng ký.' }),
    ...(available ? {} : { capacity: 'Chiến dịch đã đủ số lượng.' }),
  };
}
export function toggleRole(current: string[], role: string) {
  if (role === 'Không có ưu tiên') return current.includes(role) ? [] : [role];
  const filtered = current.filter(value => value !== 'Không có ưu tiên');
  return filtered.includes(role) ? filtered.filter(value => value !== role) : [...filtered, role];
}
