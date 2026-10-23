import { useAboutTypography } from './aboutTypography';
import { theme as buttonTheme } from '../../theme/tokens';
import { useMemo } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { ActionBackground } from '../../components/ui';
import { useAssistantContext } from '../assistant/Assistant';

const join = [
  { title: 'Tình nguyện viên', text: 'Đóng góp thời gian và trực tiếp tham gia các hoạt động cộng đồng.', image: require('../../../assets/about/join/join-volunteer.png') },
  { title: 'Đóng góp tài chính', text: 'Hỗ trợ chi phí để duy trì và mở rộng các chiến dịch.', image: require('../../../assets/about/join/join-finance.png') },
  { title: 'Đóng góp hiện vật', text: 'Quyên góp đồ dùng, sách vở, nhu yếu phẩm...', image: require('../../../assets/about/join/join-items.png') },
  { title: 'Lan tỏa thông tin', text: 'Chia sẻ chiến dịch để nhiều người cùng biết đến.', image: require('../../../assets/about/join/join-share.png') },
];
const standards = [
  { title: 'Tôn trọng', text: 'Tôn trọng mọi người, mọi hoàn cảnh và sự khác biệt.', image: require('../../../assets/about/standard/standards-respect.png') },
  { title: 'Trung thực', text: 'Cung cấp thông tin chính xác, không gian lận hay gây hiểu lầm.', image: require('../../../assets/about/standard/standards-honesty.png') },
  { title: 'Văn minh', text: 'Giao tiếp tích cực, không kỳ thị hay phân biệt.', image: require('../../../assets/about/standard/standards-civility.png') },
  { title: 'An toàn', text: 'Đảm bảo an toàn cho bản thân và cộng đồng trong mọi hoạt động.', image: require('../../../assets/about/standard/standards-safety.png') },
  { title: 'Trách nhiệm', text: 'Giữ lời hứa, hoàn thành cam kết và tôn trọng thời gian chung.', image: require('../../../assets/about/standard/standards-responsiblity.png') },
];
function participate(index: number) {
  if (index === 0) router.navigate('/');
  else if (index === 1) router.navigate('/contributions');
  else if (index === 2) Alert.alert('Trao đúng điều cần thiết', 'Xem nhu cầu hiện vật của chiến dịch và trao đổi với Ban tổ chức trước khi gửi. Mobile chưa có luồng tiếp nhận hiện vật; không có đăng ký nào được gửi tại đây.');
  else Alert.alert('Lan tỏa có trách nhiệm', 'Chia sẻ thông tin đã được kiểm chứng; xin phép trước khi đăng hình ảnh hoặc câu chuyện của người khác. Bạn cũng có thể đóng góp chuyên môn và thời gian phù hợp.');
}

// A sampled cubic curve uses native Views; no image rasterization or new native dependency.
const curve = Array.from({ length: 48 }, (_, i) => {
  const point = (t: number) => ({ x: 170 * (1-t)**3 + 3 * 18 * (1-t)**2*t + 3 * 12 * (1-t)*t*t + 455*t**3, y: 3 * 200 * (1-t)**2*t + 3 * 207 * (1-t)*t*t + 250*t**3 });
  const a = point(i / 48), b = point((i+1)/48);
  return { x: (a.x+b.x)/2, y: (a.y+b.y)/2, dx:b.x-a.x, dy:b.y-a.y };
});
function Thread({ u, reverse, height }: { u: number; reverse: boolean; height: number }) {
  return <View pointerEvents="none" accessible={false} style={{ position: 'absolute', width: 620*u, height: height*u, transform: reverse ? [{ scaleX: -1 }] : [] }}>
    {curve.map((p,i) => <View key={i} style={{ position:'absolute', left:(p.x-Math.hypot(p.dx,p.dy*height/250)/2)*u, top:p.y*height/250*u, width:(Math.hypot(p.dx,p.dy*height/250)+1)*u, height:Math.max(0.6,u), backgroundColor:'#FFB5DB', transform:[{rotate:`${Math.atan2(p.dy*height/250,p.dx)}rad`}] }} />)}
    <View style={{ position:'absolute', left:161*u, top:-8*u, width:16*u, height:16*u, borderRadius:8*u, backgroundColor:'#F565AD', borderWidth:2*u, borderColor:'white' }} />
  </View>;
}

export default function ParticipationEditorial({ kind }: { kind: 'join' | 'standards' }) {
  const isJoin = kind === 'join';
  const typography = useAboutTypography();
  const { width, fontScale } = useWindowDimensions();
  const u = Math.min(width, 520)/863;
  const large = fontScale > 1.15;
  const [loaded] = useFonts({ Lora_400Regular, Lora_400Regular_Italic });
  const s = useMemo(() => styles(u, loaded), [u, loaded]);
  const items = isJoin ? join : standards;
  const title = isJoin ? 'Tham gia cùng NOI' : 'Tiêu chuẩn cộng đồng';
  useAssistantContext(title, { page:title, sections:items.map(({title,text}) => ({title,text})) });
  return <SafeAreaView edges={['top','left','right']} style={s.screen}>
    <Stack.Screen options={{ headerShown:false }} />
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại Về NOI" onPress={() => router.canGoBack() ? router.back() : router.replace('/about')} style={s.back}><Ionicons name="chevron-back" size={25} color="#09265F" /></Pressable><Text style={[s.headerTitle, typography.header]}>{title}</Text><View style={s.back}/></View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <LinearGradient colors={isJoin ? ['#FFF8FB','#FFF9FB','#F2F8FF'] : ['#FFF8FB','#FFF8FA','#FFF8FA']}>
        <View style={[s.hero, {height:large ? undefined : (isJoin?500:345)*u}]}>
          <Image accessible={false} source={isJoin ? require('../../../assets/about/join/join-hero.png') : require('../../../assets/about/standard/standards-hero.png')} resizeMode="cover" style={[s.heroImage,{height:(isJoin?400:385)*u, width:(isJoin?370:290)*u,top:(isJoin?-15:-20)*u}]} />
          <Text accessibilityRole="header" style={[s.heroTitle,{fontSize:(isJoin?84:70)*u,lineHeight:(isJoin?94:82)*u},large && s.largeHero]}>{isJoin ? <>Mỗi người{'\n'}đều có thể{'\n'}<Text style={s.pink}>góp sức</Text></> : <>Cùng giữ NOI{'\n'}<Text style={s.pink}>an toàn & tích cực</Text></>}</Text>
          <Text style={[s.intro,{width:(isJoin?600:520)*u,marginTop:(isJoin?48:28)*u},large && s.fullWidth]}>{isJoin ? 'Bạn có thể tham gia theo nhiều cách phù hợp với khả năng và thời gian của mình.' : 'Để xây dựng một cộng đồng văn minh, thân thiện và tôn trọng lẫn nhau, chúng ta cùng thống nhất những nguyên tắc chung sau đây.'}</Text>
        </View>
        {items.map((item,index) => {
          const reverse=index%2===1;
          const rowHeight=isJoin?250:210;
          const content=<>
            {!large && <Thread u={u} reverse={reverse} height={rowHeight} />}
            <View style={[s.number,{left:(reverse?365:60)*u}]}><Text style={s.numberText}>{String(index+1).padStart(2,'0')}</Text></View>
            <Image source={item.image} accessible={false} resizeMode="cover" style={[s.photo,{left:(reverse?48:isJoin?610:550)*u,width:(isJoin?235:275)*u,height:(isJoin?225:195)*u},large && s.readingPhoto]} />
            <View style={[s.copy,{left:(reverse?isJoin?470:495:194)*u,width:(reverse?330:isJoin?405:345)*u,top:(isJoin?64:35)*u},large && s.readingCopy]}>
              <Text accessibilityRole="header" style={[s.rowTitle,!isJoin && s.pill]}>{item.title}</Text><Text style={s.body}>{item.text}</Text>
            </View>
          </>;
          return isJoin ? <Pressable accessibilityRole="button" accessibilityLabel={item.title} key={item.title} onPress={() => participate(index)} style={[{height:rowHeight*u},large && s.readingRow]}>{content}</Pressable> : <View key={item.title} style={[{height:rowHeight*u},large && s.readingRow]}>{content}</View>;
        })}
        {isJoin ? <Pressable accessibilityRole="button" onPress={() => router.navigate('/')} style={[s.cta, { overflow: 'hidden', borderColor: 'transparent' }]}>{({pressed}) => <><ActionBackground pressed={pressed} radius={32*u}/><Text style={[s.ctaText, { color: buttonTheme.buttons.primaryText }]}>Tham gia ngay</Text><Ionicons name="arrow-forward" size={38*u} color={buttonTheme.buttons.primaryText} /></>}</Pressable> : <View style={[s.footer,large && {height:undefined,minHeight:280*u}]}>
          <Image source={require('../../../assets/about/standard/standards-footer.png')} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false}/>
          <LinearGradient colors={['#FCE8F3','#FCE8F3E8','#FCE8F300']} start={{x:0,y:0.5}} end={{x:1,y:0.5}} style={StyleSheet.absoluteFill}/>
          <Text style={s.footerText}>Một cộng đồng tốt đẹp{'\n'}<Text style={s.pink}>bắt đầu từ cách chúng ta{'\n'}đối xử với nhau.</Text></Text><View style={s.underline}/>
        </View>}
      </LinearGradient>
    </ScrollView>
  </SafeAreaView>;
}
const styles=(u:number,loaded:boolean) => StyleSheet.create({
  screen:{flex:1,backgroundColor:'#FFF8FB'},header:{height:48,flexDirection:'row',alignItems:'center',alignSelf:'center',width:'100%',maxWidth:520},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerTitle:{flex:1,textAlign:'center',fontSize:30*u,fontWeight:'700',color:'#09265F'},content:{width:'100%',maxWidth:520,alignSelf:'center'},
  hero:{paddingTop:40*u,paddingLeft:48*u},heroImage:{position:'absolute',right:-12*u,top:0,borderTopLeftRadius:260*u,borderBottomLeftRadius:190*u,borderBottomRightRadius:80*u},heroTitle:{fontFamily:loaded?'Lora_400Regular':Platform.OS==='ios'?'Georgia':'serif',color:'#081D4B',letterSpacing:-2*u},pink:{color:'#EF4C99',fontFamily:loaded?'Lora_400Regular_Italic':Platform.OS==='ios'?'Georgia':'serif',fontStyle:loaded?'normal':'italic'},intro:{color:'#596F8A',fontSize:25*u,lineHeight:36*u},
  number:{position:'absolute',top:15*u,width:76*u,height:76*u,borderRadius:38*u,backgroundColor:'#FCE2F0',alignItems:'center',justifyContent:'center'},numberText:{fontFamily:loaded?'Lora_400Regular':'Georgia',fontSize:32*u,color:'#EC3989'},photo:{position:'absolute',top:8*u,borderTopLeftRadius:110*u,borderTopRightRadius:80*u,borderBottomLeftRadius:95*u,borderBottomRightRadius:100*u},copy:{position:'absolute'},rowTitle:{fontFamily:loaded?'Lora_400Regular':'Georgia',fontSize:38*u,lineHeight:48*u,color:'#0B2056',letterSpacing:-1.1*u},pill:{alignSelf:'flex-start',backgroundColor:'#FCE4F2',borderRadius:35*u,paddingHorizontal:22*u,marginLeft:-22*u},body:{fontSize:25*u,lineHeight:34*u,color:'#5C708B',marginTop:9*u},
  cta:{minHeight:106*u,marginHorizontal:44*u,marginTop:15*u,marginBottom:16*u,flexDirection:'row',gap:22*u,alignItems:'center',justifyContent:'center'},ctaText:{fontSize:34*u,fontWeight:'700',color:'#09265F'},footer:{height:280*u,overflow:'hidden',borderTopLeftRadius:100*u,borderBottomLeftRadius:100*u,marginTop:0,paddingTop:40*u,paddingLeft:60*u},footerText:{fontFamily:loaded?'Lora_400Regular_Italic':'Georgia',fontSize:40*u,lineHeight:48*u,color:'#09265F'},underline:{width:110*u,height:2*u,backgroundColor:'#F052A2',marginTop:16*u,transform:[{rotate:'-7deg'}]},
  largeHero:{fontSize:56*u,lineHeight:70*u,paddingRight:24*u},fullWidth:{width:'95%',paddingBottom:20*u},readingRow:{height:undefined,minHeight:230*u,padding:24*u,paddingLeft:150*u,gap:16*u},readingPhoto:{position:'relative',left:0,top:0,alignSelf:'flex-end'},readingCopy:{position:'relative',left:0,top:0,width:'100%'},
});

