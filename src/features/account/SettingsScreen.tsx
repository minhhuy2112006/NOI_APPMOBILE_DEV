import { useState, type PropsWithChildren } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { openAccount } from './navigation';
import { notificationSession } from './session';

function Group({title,children}:{title:string}&PropsWithChildren) {
  return <View style={s.group}><Text accessibilityRole="header" style={s.heading}>{title}</Text><View style={s.outline}>{children}</View></View>;
}
function Row({title,description,onPress,last=false,children}:{title:string;description:string;onPress?:()=>void;last?:boolean}&PropsWithChildren) {
  const copy=<><Text style={s.label}>{title}</Text><Text style={s.description}>{description}</Text></>;
  return <View style={[s.row,!last && s.divider]}>
    {onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[s.rowCopy,{opacity:pressed?0.65:1}]}>{copy}</Pressable> : <View style={s.rowCopy}>{copy}</View>}
    {children ?? <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={s.arrow}><Ionicons name="chevron-forward" color="#E51683" size={20}/></Pressable>}
  </View>;
}
export default function SettingsScreen(){
  const preferences=notificationSession.useValue();
  const [sheet,setSheet]=useState<'notifications'|'language'|'legal'|null>(null);
  const {width}=useWindowDimensions();
  const toggle=(key:keyof typeof preferences,label:string)=><Switch accessibilityLabel={label} value={preferences[key]} onValueChange={value=>notificationSession.set(current=>({...current,[key]:value}))} trackColor={{true:'#E01475',false:'#C3CDE4'}} thumbColor="#FFFFFF" ios_backgroundColor="#C3CDE4" style={s.toggle}/>;
  const close=()=>setSheet(null);
  return <LinearGradient colors={['#FFF1F6','#FCF3FC','#E3F2FF','#DEEEFF']} locations={[0,0.35,0.8,1]} style={s.fill}>
    <Stack.Screen options={{headerShown:false}}/>
    <SafeAreaView edges={['top','left','right']} style={s.fill}>
      <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại Tài khoản" onPress={()=>router.canGoBack()?router.back():router.replace('/account')} style={s.back}><Ionicons name="chevron-back" color="#DE1585" size={26}/></Pressable><Text accessibilityRole="header" style={s.title}>Cài đặt</Text><View style={s.back}/></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content,{paddingHorizontal:Math.max(12,Math.min(width,640)*30/941)}]}>
        <Group title="Tài khoản">
          <Row title="Thông tin tài khoản" description="Xem thông tin tài khoản của bạn" onPress={()=>openAccount('profile')}/>
          <Row title="Bảo mật" description="Mật khẩu và quyền riêng tư" onPress={()=>openAccount('security')}/>
          <Row title="Quản lý thiết bị" description="Xem và quản lý các thiết bị đã đăng nhập" onPress={()=>openAccount('devices')} last/>
        </Group>
        <Group title="Thông báo">
          <Row title="Thông báo chung" description="Thông tin từ hệ thống và cập nhật ứng dụng" onPress={()=>setSheet('notifications')}>{toggle('noi','Thông báo chung')}</Row>
          <Row title="Thông báo chiến dịch" description="Cập nhật về các chiến dịch mới và trạng thái đăng ký">{toggle('campaign','Thông báo chiến dịch')}</Row>
          <Row title="Thông báo điểm danh" description="Nhắc nhở lịch điểm danh khi tham gia hoạt động" last>{toggle('attendance','Thông báo điểm danh')}</Row>
        </Group>
        <Group title="Ngôn ngữ và hiển thị"><Row title="Ngôn ngữ" description="Tiếng Việt" onPress={()=>setSheet('language')} last/></Group>
        <Group title="Hỗ trợ">
          <Row title="Trung tâm trợ giúp" description="Câu hỏi thường gặp và hướng dẫn sử dụng" onPress={()=>openAccount('support')}/>
          <Row title="Liên hệ với NOI" description="Gửi phản hồi hoặc liên hệ hỗ trợ" onPress={()=>openAccount('support')}/>
          <Row title="Điều khoản và chính sách" description="Xem điều khoản sử dụng và chính sách bảo mật" onPress={()=>setSheet('legal')} last/>
        </Group>
      </ScrollView>
    </SafeAreaView>
    <Modal visible={sheet!==null} transparent animationType="fade" onRequestClose={close}>
      <View style={s.overlay}><View accessibilityViewIsModal style={s.dialog}>
        <View style={s.dialogHeader}><Text accessibilityRole="header" style={s.heading}>{sheet==='notifications'?'Tùy chọn thông báo':sheet==='language'?'Ngôn ngữ ứng dụng':'Điều khoản và chính sách'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={close} style={s.back}><Ionicons name="close" size={23} color="#0B2155"/></Pressable></View>
        <ScrollView>
          {sheet==='notifications'?<><Text style={s.description}>Tùy chọn dùng trong phiên hiện tại. Chưa đăng ký nhận push và chưa đồng bộ máy chủ.</Text><Row title="Thông báo quyên góp" description="Cập nhật về các khoản đóng góp" last>{toggle('donation','Thông báo quyên góp')}</Row></>:sheet==='language'?<><Text style={s.label}>Tiếng Việt</Text><Text style={s.description}>Hiện ứng dụng chỉ hỗ trợ tiếng Việt.</Text><Text style={[s.description,{marginTop:16}]}>Phiên bản {Constants.expoConfig?.version ?? 'Chưa có thông tin'}</Text></>:<><Row title="Điều khoản sử dụng" description="Xem nội dung điều khoản" onPress={()=>{close();openAccount('terms');}}/><Row title="Chính sách bảo mật" description="Thông tin về quyền riêng tư" onPress={()=>{close();openAccount('privacy');}} last/></>}
        </ScrollView>
      </View></View>
    </Modal>
  </LinearGradient>;
}
const s=StyleSheet.create({
  fill:{flex:1},header:{height:52,width:'100%',maxWidth:640,alignSelf:'center',flexDirection:'row',alignItems:'center'},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},title:{flex:1,textAlign:'center',fontSize:21,fontWeight:'700',color:'#081D56'},content:{width:'100%',maxWidth:640,alignSelf:'center',gap:9,paddingTop:4,paddingBottom:18},group:{backgroundColor:'#FFFFFFB8',borderRadius:16,padding:10,gap:6},heading:{fontSize:17,fontWeight:'700',color:'#081D56'},outline:{borderWidth:1,borderColor:'#E6E9FC',borderRadius:14,paddingHorizontal:10},row:{minHeight:48,flexDirection:'row',alignItems:'center',gap:8},rowCopy:{flex:1,minWidth:0,paddingVertical:8},label:{fontSize:14,lineHeight:19,color:'#0A2056',fontWeight:'500'},description:{fontSize:12,lineHeight:17,color:'#6481B3',marginTop:2},divider:{borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#E6EAF8'},arrow:{width:24,minHeight:44,alignItems:'center',justifyContent:'center'},toggle:{transform:[{scale:0.8}],marginHorizontal:-4},overlay:{flex:1,backgroundColor:'#0B205644',justifyContent:'center',padding:24},dialog:{backgroundColor:'#FFFAFE',borderRadius:20,padding:16,width:'100%',maxWidth:500,maxHeight:'80%',alignSelf:'center'},dialogHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
});
