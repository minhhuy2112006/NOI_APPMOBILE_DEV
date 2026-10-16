import { useState } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { walletSession } from "../store/session";

import {
  Action,
  Copy,
  Heading,
  Icon,
  Layout,
  Link,
  Panel,
  Quick,
  Sheet,
  s,
} from "./AccountScreenShared";

export default function PointsScreen() {
  const wallet = walletSession.useValue();
  const [sheet, setSheet] = useState<"details" | "history" | null>(null);
  const entries = [
    ...wallet.history.map((e, i) => ({
      key: `redeem-${i}`,
      title: e.title,
      description: "Đổi quà",
      points: -e.points,
    })),
    {
      key: "initial",
      title: "Điểm khởi tạo",
      description: "Số dư đầu phiên",
      points: 1250,
    },
  ];
  const history = (all: boolean) =>
    (all ? entries : entries.slice(0, 3)).map((entry, i) => (
      <View key={entry.key} style={[s.historyRow, i > 0 && s.divider]}>
        <View style={s.historyIcon}>
          <Icon name={entry.points > 0 ? "heart" : "gift"} size={30} />
        </View>
        <View style={s.historyCopy}>
          <Text style={s.historyTitle}>{entry.title}</Text>
          <Copy>{entry.description}</Copy>
        </View>
        <View style={s.pointsBadge}>
          <Text style={s.pointsBadgeText}>
            {entry.points > 0 ? "+" : "−"}
            {Math.abs(entry.points).toLocaleString("vi-VN")} điểm
          </Text>
        </View>
      </View>
    ));
  return (
    <Layout title="Điểm Phước" rose help={() => setSheet("details")}>
      <LinearGradient
        colors={["#FFF5FA", "#FDE5F2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.balancePanel}
      >
        <View style={s.medal}>
          <Icon name="ribbon" color="#F269A6" size={83} />
          <View style={s.medalHeart}>
            <Icon name="heart" color="#FFE5F4" size={30} />
          </View>
        </View>
        <View style={s.balanceCopy}>
          <Copy>Tổng điểm Phước của bạn</Copy>
          <Text style={s.balance}>
            {wallet.balance.toLocaleString("vi-VN")}
            <Text style={s.pointUnit}> điểm</Text>
          </Text>
        </View>
        <View style={s.balanceAction}>
          <Action
            title="Xem chi tiết"
            icon="stats-chart"
            onPress={() => setSheet("details")}
          />
        </View>
      </LinearGradient>
      <Panel>
        <Heading>Thao tác nhanh</Heading>
        <View style={s.quickRow}>
          <Quick
            title="Điểm danh"
            description="Ghi nhận tham gia hoạt động"
            icon="scan"
            onPress={() => router.push("/attendance")}
          />
          <Quick
            title="Xem lịch sử điểm"
            description="Xem chi tiết điểm Phước của bạn"
            icon="document-text-outline"
            onPress={() => setSheet("history")}
          />
          <Quick
            title="Đổi quà"
            description="Sử dụng điểm Phước để đổi quà ý nghĩa"
            icon="gift-outline"
            onPress={() => router.navigate("/store")}
          />
        </View>
      </Panel>
      <Panel>
        <View style={s.sectionHead}>
          <Heading>Lịch sử điểm Phước</Heading>
          <Link title="Xem tất cả" onPress={() => setSheet("history")} />
        </View>
        <View style={s.outline}>{history(false)}</View>
      </Panel>
      <LinearGradient
        colors={["#FCE6F4", "#FFF4FA", "#FBDDEE"]}
        style={s.pointsIntro}
      >
        <View style={s.introCopy}>
          <Heading>Giới thiệu về điểm Phước</Heading>
          <Copy>
            Điểm Phước ghi nhận những đóng góp tích cực cho cộng đồng. Bạn có
            thể sử dụng số điểm hiện có để đổi những phần quà ý nghĩa.
          </Copy>
        </View>
        <View style={s.gift}>
          <Icon name="gift" size={92} color="#F485BA" />
          <View style={s.giftHeart}>
            <Icon name="heart" size={25} color="#EC3F94" />
          </View>
        </View>
      </LinearGradient>
      <Sheet
        title={
          sheet === "history" ? "Lịch sử điểm Phước" : "Thông tin điểm Phước"
        }
        visible={sheet !== null}
        close={() => setSheet(null)}
      >
        {sheet === "history" ? (
          history(true)
        ) : (
          <>
            <Text style={s.balance}>
              {wallet.balance.toLocaleString("vi-VN")}
              <Text style={s.pointUnit}> điểm</Text>
            </Text>
            <Copy>
              Điểm khả dụng trong phiên demo, không có giá trị tiền tệ. Hạng
              hiện tại: Mầm xanh (minh họa).
            </Copy>
            <Copy>
              Quy tắc cộng điểm chính thức chưa được kết nối. Điểm danh không tự
              cộng điểm; lịch sử ở đây ghi nhận số điểm khởi tạo và các lần đổi
              quà trong phiên.
            </Copy>
            <Action
              title="Xem quà tại Cửa hàng"
              onPress={() => {
                setSheet(null);
                router.navigate("/store");
              }}
            />
          </>
        )}
      </Sheet>
    </Layout>
  );
}