export const gifts = [
  { id: 'tote', title: 'Túi vải NOI', points: 500, quadrant: 0, description: 'Túi vải mang theo những điều tử tế mỗi ngày.' },
  { id: 'bottle', title: 'Bình nước', points: 800, quadrant: 1, description: 'Bình nước tái sử dụng với sắc hồng NOI.' },
  { id: 'pin', title: 'Huy hiệu Mầm xanh', points: 250, quadrant: 2, description: 'Một mầm xanh nhỏ ghi nhận hành trình đóng góp.' },
  { id: 'notebook', title: 'Sổ tay việc tốt', points: 350, quadrant: 3, description: 'Lưu lại ý tưởng và những việc tốt mỗi ngày.' },
  // Additional demo variants reuse the original product photos to preview pagination.
  { id: 'tote-mini', title: 'Túi vải mini', points: 400, quadrant: 0, description: 'Quà mẫu: phiên bản túi nhỏ gọn. Ảnh minh họa dùng chung với túi vải NOI.' },
  { id: 'bottle-pocket', title: 'Bình nước bỏ túi', points: 650, quadrant: 1, description: 'Quà mẫu: bình nước nhỏ mang theo hằng ngày. Ảnh minh họa dùng chung với bình nước NOI.' },
  { id: 'pin-kindness', title: 'Huy hiệu Tử tế', points: 200, quadrant: 2, description: 'Quà mẫu: huy hiệu ghi nhận những việc tốt. Ảnh minh họa dùng chung với huy hiệu Mầm xanh.' },
  { id: 'notebook-pocket', title: 'Sổ tay bỏ túi', points: 300, quadrant: 3, description: 'Quà mẫu: sổ nhỏ ghi lại hành trình tình nguyện. Ảnh minh họa dùng chung với sổ tay việc tốt.' },
  { id: 'tote-companion', title: 'Túi vải Đồng hành', points: 600, quadrant: 0, description: 'Quà mẫu: túi vải đồng hành cùng hoạt động cộng đồng. Ảnh minh họa dùng chung với túi vải NOI.' },
  { id: 'bottle-green', title: 'Bình nước Sống xanh', points: 950, quadrant: 1, description: 'Quà mẫu: bình nước cho hành trình sống xanh. Ảnh minh họa dùng chung với bình nước NOI.' },
  { id: 'pin-set', title: 'Bộ huy hiệu NOI', points: 450, quadrant: 2, description: 'Quà mẫu: bộ huy hiệu kỷ niệm. Ảnh minh họa dùng chung với huy hiệu Mầm xanh.' },
  { id: 'notebook-set', title: 'Bộ sổ Hành trình', points: 700, quadrant: 3, description: 'Quà mẫu: bộ sổ lưu lại những điều ý nghĩa. Ảnh minh họa dùng chung với sổ tay việc tốt.' },
] as const;
export type Gift = typeof gifts[number];
export type Wallet = { balance: number; redeemed: string[]; history: { title: string; points: number }[] };
export const initialWallet: Wallet = { balance: 1250, redeemed: [], history: [] };
export function redeemGift(wallet: Wallet, id: string): Wallet {
  const gift = gifts.find(item => item.id === id);
  if (!gift || wallet.redeemed.includes(id) || wallet.balance < gift.points) return wallet;
  return { balance: wallet.balance - gift.points, redeemed: [...wallet.redeemed, id], history: [{ title: gift.title, points: gift.points }, ...wallet.history] };
}
