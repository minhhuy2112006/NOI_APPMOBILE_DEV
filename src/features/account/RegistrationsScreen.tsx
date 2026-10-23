import { directAttendance } from '../attendance/directAttendance';
import { TaskCard } from '../assignments/TaskPresentation';
import { useCallback, useState } from "react";
import { Image, Pressable, Text, View, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";

import { campaigns } from "../campaigns/data";
import { demoSession } from "../assignments/demo";
import { context } from "../assignments/model";
import { registrationLabels, registrationMatches } from "./model";

import {
  Action,
  Copy,
  Icon,
  Layout,
  Panel,
  pink,
  s,
} from "./AccountScreenShared";

const photos: Record<string, number> = {
  "mam-xanh": require("../../../assets/campaigns/garden.webp"),
  "trang-sach": require("../../../assets/campaigns/books.webp"),
  "bua-com": require("../../../assets/campaigns/meals.webp"),
  "bien-xanh": require("../../../assets/campaigns/community.webp"),
};

export default function RegistrationsScreen() {
  const [tab, setTab] = useState("Đăng ký");
  const [filter, setFilter] = useState("Tất cả");
  const filterTags = [
    {
      label: "Tất cả",
      value: "Tất cả",
    },
    {
      label: "Đã đăng ký",
      value: "Đã đăng ký/đã xác nhận",
    },
    {
      label: "Đang chờ",
      value: "Đang chờ",
    },
    {
      label: "Đã tham gia",
      value: "Đã tham gia",
    },
    {
      label: "Đã hủy",
      value: "Đã hủy",
    },
  ];
  const [snapshot, setSnapshot] = useState(demoSession.read);
  const [actor, setActor] = useState(demoSession.actor);
  useFocusEffect(
    useCallback(() => {
      setSnapshot(demoSession.read());
      setActor(demoSession.actor());
    }, []),
  );
  const tasks = snapshot.assignments.filter((a) => a.member_id === actor);
  const items = snapshot.applications.filter(
    (a) => a.user_id === actor && registrationMatches(a.status, filter),
  );
  return (
    <Layout title="Đăng ký của tôi">
      <View style={s.tabs}>
        {["Đăng ký", "Công việc"].map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={[s.tab, tab === t && s.activeTab]}
          >
            <Text style={[s.tabText, tab === t && { color: pink }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {tab === "Đăng ký" ? (
        <><ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterTagsContent}
          style={s.filterTagsScroll}
        >
          {filterTags.map((item) => {
            const active = filter === item.value;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(item.value)}
                style={({ pressed }) => [
                  s.filterTag,
                  active && s.filterTagActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[s.filterTagText, active && s.filterTagTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
          {!items.length && (
            <Panel>
              <Copy>Chưa có đăng ký trong mục này.</Copy>
            </Panel>
          )}
          {items.map((item) => {
            const campaign = campaigns.find((c) => c.id === item.campaign_id);
            const approved = item.status === "confirmed";
            const completed = item.status === "completed";
            const detail = () =>
              campaign &&
              router.push({
                pathname: "/campaigns/[id]",
                params: { id: campaign.id },
              });
            return (
              <View key={item.id} style={s.registration}>
                <View style={s.registrationTop}>
                  {Boolean(photos[item.campaign_id]) && (
                    <Image
                      source={photos[item.campaign_id]}
                      style={s.campaignImage}
                    />
                  )}
                  <View style={s.registrationCopy}>
                    <Text style={s.campaignTitle}>
                      {campaign?.title ?? "Chiến dịch chưa có thông tin"}
                    </Text>
                    <View style={s.meta}>
                      <Icon name="calendar-outline" size={17} color="#C33B7C" />
                      <Text style={s.metaText}>
                        {campaign?.dateLabel ?? "Chưa có lịch"}
                      </Text>
                    </View>
                    <View style={s.meta}>
                      <Icon name="time-outline" size={17} color="#C33B7C" />
                      <Text style={s.metaText}>
                        {campaign?.timeLabel ?? "Chưa có lịch"}
                      </Text>
                    </View>
                    <View style={s.meta}>
                      <Icon name="location-outline" size={17} color="#C33B7C" />
                      <Text style={s.metaText}>
                        {campaign?.location ?? "Chưa có địa điểm"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={s.registrationActions}>
                  <View style={s.registrationStatus}>
                    <Icon
                      name="checkmark-circle"
                      size={19}
                      color={completed ? "#62B636" : pink}
                    />
                    <Text style={s.statusText}>
                      {approved || completed
                        ? "Đã đăng ký"
                        : registrationLabels[item.status]}
                    </Text>
                  </View>
                  {approved ? (
                    <Action
                      title="Điểm danh"
                      icon="camera-outline"
                      filled
                      onPress={() => { void directAttendance(item.campaign_id, actor); }}
                    />
                  ) : (
                    <View style={s.registrationStatus}>
                      <Icon name="calendar-outline" size={18} color="#65718F" />
                      <Text style={s.statusText}>
                        {completed ? "Đã tham gia" : "Chờ xác nhận"}
                      </Text>
                    </View>
                  )}
                  {campaign && <Action muted title="Xem chi tiết" onPress={detail} />}
                </View>
              </View>
            );
          })}
        </>
      ) : (
        <>
          {!tasks.length && (
            <Panel>
              <Copy>Bạn chưa được phân công công việc.</Copy>
            </Panel>
          )}
          {tasks.map(a => <TaskCard compact key={a.id} data={snapshot} assignment={a} actor={snapshot.people.find(p => p.id === actor)!} open={() => router.push({ pathname: '/assignments', params: { campaignId: context(snapshot, a).group.campaign_id, assignmentId: a.id } })} />)}
        </>
      )}
    </Layout>
  );
}
