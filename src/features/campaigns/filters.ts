import { campaigns, normalizeSearch } from './data';
export const options = {
  city: [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Hải Phòng',
    'Huế',
    'Đà Nẵng',
    'Cần Thơ',
    'An Giang',
    'Bắc Ninh',
    'Cà Mau',
    'Cao Bằng',
    'Điện Biên',
    'Đắk Lắk',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Tĩnh',
    'Hưng Yên',
    'Khánh Hòa',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Nghệ An',
    'Ninh Bình',
    'Phú Thọ',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sơn La',
    'Tây Ninh',
    'Thanh Hóa',
    'Thái Nguyên',
    'Tuyên Quang',
    'Vĩnh Long',
  ],
  category: ['Giáo dục', 'Môi trường', 'Cộng đồng', 'Khẩn cấp'],
  resource: ['Thời gian', 'Vật phẩm'],
  skill: ['Không yêu cầu', 'Đọc sách', 'Nấu ăn'],
  format: ['Trực tiếp', 'Trực tuyến'],
  status: ['Đang tuyển', 'Đủ số lượng'],
};
export type Filters = { query: string } & Record<keyof typeof options, string>;
export const emptyFilters: Filters = { query: '', city: '', category: '', resource: '', skill: '', format: '', status: '' };
// Presentation-only metadata; confirm backend contracts before integration.
export const metadata: Record<string, { resource: string; skill: string; format: string }> = {
  'mam-xanh': { resource: 'Thời gian', skill: 'Không yêu cầu', format: 'Trực tiếp' },
  'trang-sach': { resource: 'Vật phẩm', skill: 'Đọc sách', format: 'Trực tiếp' },
  'bua-com': { resource: 'Thời gian', skill: 'Nấu ăn', format: 'Trực tiếp' },
  'bien-xanh': { resource: 'Thời gian', skill: 'Không yêu cầu', format: 'Trực tiếp' },
};
export function applyFilters(filters: Filters) {
  return campaigns.filter(item => {
    const extra = metadata[item.id];
    const status = item.registered >= item.capacity ? 'Đủ số lượng' : 'Đang tuyển';
    return (!filters.city || filters.city === item.city) && (!filters.category || filters.category === item.category) &&
      (!filters.resource || filters.resource === extra.resource) && (!filters.skill || filters.skill === extra.skill) &&
      (!filters.format || filters.format === extra.format) && (!filters.status || filters.status === status) &&
      normalizeSearch(`${item.title} ${item.city} ${item.organization} ${extra.skill}`).includes(normalizeSearch(filters.query));
  });
}
