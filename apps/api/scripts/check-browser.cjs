// Read-only live UI check: short-lived test token, no login/session or form writes.
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const { chromium }=require('playwright-core');const { JwtService }=require('@nestjs/jwt');
const root=path.resolve(__dirname,'../../..');
for(const file of [path.join(root,'apps/api/.env'),path.join(root,'.env')])if(fs.existsSync(file))process.loadEnvFile(file);
(async()=>{
 const backup=JSON.parse(fs.readFileSync(fs.readFileSync(path.join(root,'.migration-work/snapshot-path.txt'),'utf8').trim(),'utf8'));
 const account=JSON.parse(backup.tables.NguoiDung.data).find(u=>u.role==='ACADEMIC_STAFF');
 const token=new JwtService().sign({sub:String(account.id),email:account.email,role:account.role,type:'access'},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'10m'});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const errors=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Ho_Chi_Minh'});
  await context.addCookies([{name:'access_token',value:token,domain:'localhost',path:'/',httpOnly:true,sameSite:'Lax'}]);
  await context.addInitScript(user=>localStorage.setItem('riki-auth',JSON.stringify({user,accessToken:''})),{id:Number(account.id),email:account.email,fullName:account.full_name,role:account.role,initials:'HV'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3000/academic/data');
  await page.getByRole('heading',{name:'Cập nhật đào tạo',exact:true}).waitFor({timeout:60000});
  await page.getByLabel('Ngày sinh *',{exact:true}).waitFor();
  await page.getByRole('combobox').first().selectOption('classes');
  await page.getByLabel('Link vào học trực tuyến',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Danh mục và trọng số',exact:true}).click();
  assert.equal(await page.getByLabel('Kiểm tra thường xuyên (%)',{exact:true}).inputValue(),'10');
  assert.equal(await page.getByLabel('Giữa kỳ (%)',{exact:true}).inputValue(),'40');
  assert.equal(await page.getByLabel('Cuối kỳ (%)',{exact:true}).inputValue(),'50');
  await page.screenshot({path:path.join(root,'.migration-work/academic-weights.png'),fullPage:true});
  await page.getByRole('button',{name:'Bảo lưu và chuyển lớp',exact:true}).click();
  await page.getByRole('heading',{name:'Ghi danh, bảo lưu và chuyển lớp',exact:true}).waitFor();
  await page.getByRole('heading',{name:'Lịch sử chuyển lớp',exact:true}).waitFor();
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>{const sidebar=document.querySelector('aside');return !sidebar||sidebar.getBoundingClientRect().right<=1;});
  assert(await page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth+1),'Mobile page has horizontal overflow');
  await page.screenshot({path:path.join(root,'.migration-work/academic-mobile.png'),fullPage:true});
  const teacher=JSON.parse(backup.tables.NguoiDung.data).find(u=>u.role==='TEACHER');
  const teacherToken=new JwtService().sign({sub:String(teacher.id),email:teacher.email,role:teacher.role,type:'access'},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'10m'});
  const teacherContext=await browser.newContext({viewport:{width:1280,height:900}});
  await teacherContext.addCookies([{name:'access_token',value:teacherToken,domain:'localhost',path:'/',httpOnly:true,sameSite:'Lax'}]);
  await teacherContext.addInitScript(user=>localStorage.setItem('riki-auth',JSON.stringify({user,accessToken:''})),{id:Number(teacher.id),email:teacher.email,fullName:teacher.full_name,role:teacher.role,initials:'GV'});
  const teacherPage=await teacherContext.newPage();teacherPage.on('pageerror',e=>errors.push(e.message));
  await teacherPage.goto('http://localhost:3000/teacher/substitutions');
  await teacherPage.getByRole('heading',{name:'Buổi dạy thay',exact:true}).waitFor();
  await teacherPage.getByText('Bạn chưa được phân công buổi dạy thay.',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  const manifest={checkedAt:new Date().toISOString(),readOnly:true,checks:['Documented student fields render','Class meeting URL editor renders','Live 10/40/50 weights render correctly','Reservation and transfer controls render','390px mobile viewport has no horizontal overflow','Teacher substitute-lesson page renders with correct empty state','No browser runtime exceptions']};
  fs.writeFileSync(path.join(root,'database-browser-check.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
