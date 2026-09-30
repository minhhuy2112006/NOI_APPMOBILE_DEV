import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, typography } from '../../components/ui';
import { campaigns } from '../../features/campaigns/data';
import { theme } from '../../theme/tokens';

export default function CampaignDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaign = campaigns.find(item => item.id === id);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const registered = registeredId === id;
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
      {!campaign ? <Card><Text style={typography.heading}>Không tìm thấy chiến dịch</Text><Button title="Về danh sách" onPress={() => router.replace('/')} /></Card> : <>
        <Text style={typography.eyebrow}>CHIẾN DỊCH MẪU · {campaign.category.toUpperCase()}</Text>
        <Text style={typography.title}>{campaign.title}</Text>
        <Text style={typography.muted}>{campaign.organization}</Text>
        <Card><Text style={typography.heading}>Thông tin hoạt động</Text><Text style={typography.body}>{campaign.schedule}{'\n'}{campaign.city}{'\n'}{campaign.location}</Text><Text style={typography.muted}>Lịch minh họa, chưa có ngày tổ chức chính thức.</Text></Card>
        <Card><Text style={typography.heading}>Cùng nhau làm gì?</Text><Text style={typography.body}>{campaign.description}</Text><Text style={typography.heading}>Bạn cần chuẩn bị</Text><Text style={typography.body}>{campaign.preparation}</Text></Card>
        <View style={{ gap: 12 }}>
          <Text style={typography.muted}>Đăng ký demo chỉ hiển thị trên màn hình này và mất khi rời trang. Không gửi thông tin hoặc giữ chỗ với tổ chức.</Text>
          {registered ? <Card><Text accessibilityLiveRegion="polite" style={typography.body}>Đã ghi nhận thao tác đăng ký demo. Chưa có đăng ký thực tế.</Text><Button title="Hủy đăng ký demo" onPress={() => setRegisteredId(null)} /></Card> :
            <Button title={campaign.registered >= campaign.capacity ? 'Đã đủ số lượng (mẫu)' : 'Thử đăng ký tham gia'} disabled={campaign.registered >= campaign.capacity} onPress={() => setRegisteredId(campaign.id)} />}
        </View>
      </>}
    </ScrollView>
  </SafeAreaView>;
}
