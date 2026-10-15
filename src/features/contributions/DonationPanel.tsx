import { donationSession, type DonationEntry } from './session';
import { theme } from '../../theme/tokens';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip } from '../../components/ui';
export type DonationTarget = { id: string; title: string };
export type DonationFlow = { mode: 'donate' | 'history' | 'receipts' | 'recurring'; target?: DonationTarget } | null;
type Entry = DonationEntry;
type Plan = { id: string; target: string; amount: number; frequency: string };
const money = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';
export function DonationPanel({ flow, targets, onClose }: { flow: DonationFlow; targets: DonationTarget[]; onClose: () => void }) {
  const entries = donationSession.useValue();
  const setEntries = donationSession.set;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [amount, setAmount] = useState('50000');
  const [targetId, setTargetId] = useState('reserve');
  const [frequency, setFrequency] = useState('Hằng tháng');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [receipt, setReceipt] = useState<Entry | null>(null);
  const submitted = useRef(false);
  const close = () => { setError(''); setNotice(''); setReceipt(null); submitted.current = false; onClose(); };
  const target = flow?.target ?? targets.find(item => item.id === targetId) ?? targets[0];
  const submit = () => {
    if (submitted.current) return;
    const value = Number(amount);
    if (!/^\d+$/.test(amount) || !Number.isSafeInteger(value) || value < 1000 || value > 100000000) { setError('Nhập số tiền nguyên từ 1.000đ đến 100.000.000đ.'); return; }
    if (!target) { setError('Vui lòng chọn nơi đóng góp.'); return; }
    submitted.current = true;
    setError('');
    const id = 'DEMO-' + Date.now().toString(36).toUpperCase();
    if (flow?.mode === 'recurring') {
      setPlans(current => [{ id, target: target.title, amount: value, frequency }, ...current]);
      setNotice('Đã lưu lịch mẫu. Không tự trừ tiền hoặc thực hiện giao dịch.');
    } else {
      const entry = { id, target: target.title, amount: value, date: new Date().toLocaleString('vi-VN') };
      setEntries(current => [entry, ...current]); setReceipt(entry);
      setNotice('Đã ghi nhận thao tác demo. Không có tiền được chuyển.');
    }
  };
  const title = flow?.mode === 'history' ? 'Lịch sử đóng góp' : flow?.mode === 'receipts' ? 'Biên nhận' : flow?.mode === 'recurring' ? 'Đóng góp định kỳ' : 'Đóng góp';
  const card = { padding: 14, borderRadius: 16, backgroundColor: '#F7EDF8', gap: 8 } as const;
  return <Modal visible={flow !== null} transparent animationType="slide" onRequestClose={close}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#151B4255' }}><Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={close} style={{ position: 'absolute', inset: 0 }} /><SafeAreaView edges={['bottom']} style={{ maxHeight: '90%', backgroundColor: '#FFFAFE', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ fontSize: 22, fontWeight: '800', color: '#18224B', flex: 1 }}>{title}</Text><Pressable accessibilityRole="button" onPress={close} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}><Text>Đóng</Text></Pressable></View>
    <Text style={{ color: '#92738D', lineHeight: 20 }}>Chế độ demo · Dữ liệu chỉ giữ trong phiên này. Chưa kết nối thanh toán.</Text>
    {(flow?.mode === 'donate' || flow?.mode === 'recurring') && !notice && <>
      <Text style={{ fontWeight: '700' }}>Đóng góp đến: {target?.title}</Text>
      {!flow.target && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{targets.map(item => <Chip key={item.id} label={item.title} selected={target?.id === item.id} onPress={() => setTargetId(item.id)} />)}</ScrollView>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{[20000, 50000, 100000, 200000].map(value => <Chip key={value} label={money(value)} selected={amount === String(value)} onPress={() => { setAmount(String(value)); setError(''); }} />)}</View>
      <TextInput accessibilityLabel="Số tiền đóng góp (đồng)" keyboardType="number-pad" placeholder="Nhập số tiền khác (đồng)" value={amount} onChangeText={setAmount} maxLength={12} style={{ borderWidth: 1, borderColor: '#DFD3EC', borderRadius: 12, minHeight: 48, padding: 12, fontSize: 16 }} />
      {flow.mode === 'recurring' && <View style={{ flexDirection: 'row', gap: 8 }}>{['Hằng tuần', 'Hằng tháng'].map(value => <Chip key={value} label={value} selected={frequency === value} onPress={() => setFrequency(value)} />)}</View>}
      {error ? <Text accessibilityRole="alert" style={{ color: '#B12C5F' }}>{error}</Text> : null}
      <Text>Xác nhận {money(Number(amount) || 0)} cho {target?.title}{flow.mode === 'recurring' ? ' · ' + frequency.toLowerCase() : ''}.</Text>
      <Button title={flow.mode === 'recurring' ? 'Lưu lịch đóng góp demo' : 'Xác nhận đóng góp demo'} onPress={submit} />
    </>}
    {notice ? <Text accessibilityLiveRegion="polite" style={{ color: '#397954', fontWeight: '600' }}>{notice}</Text> : null}
    {(flow?.mode === 'history' || flow?.mode === 'receipts') && <>{entries.length === 0 ? <Text>Chưa có {flow.mode === 'history' ? 'đóng góp' : 'biên nhận'} demo. Hãy thử nút Đóng góp trên một chiến dịch.</Text> : entries.map(entry => <Pressable accessibilityRole="button" key={entry.id} onPress={() => setReceipt(entry)} style={card}><Text style={{ fontWeight: '700' }}>{entry.target}</Text><Text>{money(entry.amount)} · {entry.date}</Text><Text style={{ color: theme.buttons.text }}>Xem biên nhận demo ›</Text></Pressable>)}</>}
    {receipt && <View style={card}><Text style={{ fontWeight: '800' }}>BIÊN NHẬN MÔ PHỎNG</Text><Text>{receipt.id}</Text><Text>{receipt.target}</Text><Text>{money(receipt.amount)} · {receipt.date}</Text><Text>Không có giá trị xác nhận thanh toán hoặc chứng từ thuế.</Text></View>}
    {flow?.mode === 'recurring' && <><Text style={{ fontWeight: '700' }}>Lịch đã lưu ({plans.length})</Text>{plans.length === 0 && <Text>Chưa có lịch đóng góp định kỳ.</Text>}{plans.map(plan => <View key={plan.id} style={card}><Text style={{ fontWeight: '700' }}>{plan.target}</Text><Text>{money(plan.amount)} · {plan.frequency} · Chỉ mô phỏng</Text><Button title="Hủy lịch demo" onPress={() => setPlans(current => current.filter(item => item.id !== plan.id))} /></View>)}</>}
  </ScrollView></SafeAreaView></View></Modal>;
}
