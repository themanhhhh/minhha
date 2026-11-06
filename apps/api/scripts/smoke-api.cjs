// Writes are restricted to the loopback rehearsal API. Live mode is read-only.
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const origin=process.env.RIKI_SMOKE_URL??'http://127.0.0.1:4010/api/v1';
if (new URL(origin).hostname!=='127.0.0.1'||new URL(origin).port!=='4010') throw new Error('Smoke mutations are only allowed on staging port 4010');
const snapshot=JSON.parse(fs.readFileSync(fs.readFileSync(path.join(root,'.migration-work/snapshot-path.txt'),'utf8').trim(),'utf8'));
const users=JSON.parse(snapshot.tables.NguoiDung.data);
const passed=[];
async function request(route,cookie='',method='GET',body,expected=200){const response=await fetch(`${origin}${route}`,{method,headers:{...(cookie?{cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await response.json();}catch{data=null;}assert.equal(response.status,expected,`${method} ${route}: ${data?.message??response.status}`);return {data,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')};}
(async()=>{
 const sessions={};
 for(const role of ['ACADEMIC_STAFF','DIRECTOR','TEACHER','STUDENT']){
  const user=users.find(u=>u.role===role);const login=await request('/auth/login','','POST',{email:user.email,password:'12345678'},201);sessions[role]=login.cookie;
  assert.equal(login.data.user.role,role);await request('/auth/me',login.cookie);await request('/dashboard/me',login.cookie);passed.push(`Login, own profile and dashboard: ${role}`);
 }
 const staff=sessions.ACADEMIC_STAFF,student=sessions.STUDENT;
 for(const endpoint of ['/lookups','/students?status=WAITING','/students?status=RESERVED','/students?status=COMPLETED','/courses','/classes','/lessons','/users','/academic/operations','/reports/classes?period=year'])await request(endpoint,staff);
 passed.push('Lookup, all learning-status filters, management lists and reports');
 for(const endpoint of ['/me/profile','/me/classes','/me/scores','/me/attendance','/me/progress','/me/schedule','/me/notifications'])await request(endpoint,student);
 passed.push('Student portal, weighted grades, schedule and notifications');
 await request('/lookups/test-weights',student,'PATCH',{entries:[]},403);passed.push('Student cannot change weights');
 const teachers=(await request('/teachers',staff)).data.data;
 const teacherAccount=users.find(u=>u.role==='TEACHER');
 const teacher=teachers.find(t=>t.email!==teacherAccount.email);
 const substitute=teachers.find(t=>t.email===teacherAccount.email);
 const suffix=Date.now();
 const lessonDate=`${2000+Math.floor(suffix/336)%15}-${String(1+Math.floor(suffix/28)%12).padStart(2,'0')}-${String(1+suffix%28).padStart(2,'0')}`;
 const course=(await request('/courses',staff,'POST',{code:`TEST-${suffix}`,name:'Migration verification',level:'N5',totalLessons:3,tuition:100,description:'Migration smoke fixture'},201)).data;
 const makeClass=async(code,capacity=1)=>(await request('/classes',staff,'POST',{code:`${code}-${suffix}`,name:`Class ${code}`,courseId:course.id,teacherId:teacher.id,startDate:'2000-01-01',schedule:'Thứ 2 · 19:00',session:'19:00–20:30',capacity,meetingUrl:'https://example.com/class'},201)).data;
 const a=await makeClass('A'),b=await makeClass('B');
 const makeStudent=async(label)=>(await request('/students',staff,'POST',{studentCode:`${label}-${suffix}`,fullName:`Verification ${label}`,email:`${label}-${suffix}@example.test`,dateOfBirth:'2000-01-01',goal:'Đạt N5',emergencyContact:'Liên hệ kiểm thử',phone:undefined,currentLevel:'N5',targetLevel:'N5',password:'12345678'},201)).data.data;
 const one=await makeStudent('one'),two=await makeStudent('two');
 await request(`/classes/${a.id}/students`,staff,'POST',{studentId:one.id},201);
 assert.equal((await request(`/classes/${a.id}`,staff)).data.studentCount,1);
 await request(`/classes/${a.id}/students`,staff,'POST',{studentId:two.id},409);
 passed.push('Create student/course/class with documented fields; capacity enforcement');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const reservation=(await request('/academic/reservations',staff,'POST',{studentId:one.id,classId:a.id,startDate:today,durationMonths:1,reason:'Smoke verification'},201)).data;
 assert.equal((await request(`/classes/${a.id}`,staff)).data.studentCount,0);
 assert.equal((await request(`/students/${one.id}`,staff)).data.status,'RESERVED');
 await request(`/academic/reservations/${reservation.id}/resume`,staff,'POST',undefined,201);
 assert.equal((await request(`/classes/${a.id}`,staff)).data.studentCount,1);
 passed.push('Reserve and resume atomically update learning status and occupancy');
 await request('/academic/transfers',staff,'POST',{studentId:one.id,fromClassId:a.id,toClassId:b.id,reason:'Smoke verification'},201);
 assert.equal((await request(`/classes/${a.id}`,staff)).data.studentCount,0);assert.equal((await request(`/classes/${b.id}`,staff)).data.studentCount,1);
 passed.push('Transfer retains history and moves occupancy atomically');
 const lesson=(await request('/lessons',staff,'POST',{classId:b.id,title:'Rehearsal lesson',lessonDate,startTime:'19:00',endTime:'20:30',content:'Nội dung kiểm thử',status:'COMPLETED',substituteTeacherId:substitute.id},201)).data;
 assert.equal(lesson.startTime,'19:00');assert.equal(new Date(lesson.startsAt).toISOString(),`${lessonDate}T12:00:00.000Z`);
 await request(`/lessons/${lesson.id}/record`,staff,'PATCH',{recordUrl:'https://example.com/record'});
 await request(`/lessons/${lesson.id}/attendance`,sessions.TEACHER);
 await request(`/lessons/${lesson.id}/record`,sessions.TEACHER,'PATCH',{recordUrl:'https://example.com/substitute-record'});
 await request(`/lessons/${lesson.id}`,sessions.TEACHER,'PATCH',{title:'Forbidden class edit'},403);
 await request(`/lessons/${lesson.id}`,student,'GET',undefined,403);
 await request('/tests',sessions.TEACHER,'POST',{classId:b.id,name:'Forbidden class test',type:'QUIZ'},403);
 passed.push('Substitute teacher can access only the assigned lesson; class/test and unrelated student access are denied');
 const blank=(await request(`/lessons/${lesson.id}/attendance`,staff)).data.data;assert.equal(blank[0].status,null);
 await request(`/lessons/${lesson.id}/attendance`,staff,'PUT',{entries:[{studentId:one.id,status:'LATE',note:'Kiểm thử'}]});
 passed.push('Lesson wall-clock round trip, record and unmarked/LATE attendance');
 const entries=[];
 for(const [type,value]of [['QUIZ',7],['MIDTERM',8],['FINAL',9]]){
  const test=(await request('/tests',staff,'POST',{classId:b.id,name:type,type,maxScore:10,testDate:'2026-01-01'},201)).data;
  await request(`/tests/${test.id}/scores`,staff,'PUT',{entries:[{studentId:one.id,value}]});entries.push(test.id);
 }
 const graded=(await request(`/students/${one.id}`,staff)).data;
 assert.equal(graded.averageScore,8.4);assert.equal(graded.grading.finalAverage,8.4);
 passed.push('Selected weights 10/40/50 yield 8.4 consistently in student summary');
 const cancelled=(await request('/academic/reservations',staff,'POST',{studentId:one.id,classId:b.id,startDate:today,durationMonths:1,reason:'Cancel verification'},201)).data;
 await request(`/academic/reservations/${cancelled.id}/cancel`,staff,'POST',undefined,201);
 assert.equal((await request(`/classes/${b.id}`,staff)).data.studentCount,0);
 passed.push('Cancelling a reservation preserves history without restoring occupancy');
 const lastSlot=await makeClass('Concurrency');
 const racing=await Promise.all([one,two].map(async person=>{const response=await fetch(`${origin}/classes/${lastSlot.id}/students`,{method:'POST',headers:{cookie:staff,'Content-Type':'application/json'},body:JSON.stringify({studentId:person.id})});await response.arrayBuffer();return response.status;}));
 assert.deepEqual(racing.sort(),[201,409]);
 assert.equal((await request(`/classes/${lastSlot.id}`,staff)).data.studentCount,1);
 passed.push('Two concurrent enrollment requests for the last slot produce exactly one success');
 const crypto=require('node:crypto');
 const manifest={checkedAt:new Date().toISOString(),environment:'local migrated copy',migrationSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'apps/api/prisma/migrations/202611060001_document_schema/migration.sql'))).digest('hex'),passed};fs.writeFileSync(path.join(root,'database-api-smoke.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
