"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_KEY = "masarak_admin_2026";

const UNI_LIST = [
  { short:"AUB",  name:"الجامعة الأمريكية في بيروت",    region:"بيروت",          def:"https://picsum.photos/seed/AUB-beirut/800/450" },
  { short:"LAU",  name:"الجامعة اللبنانية الأمريكية",    region:"بيروت وبيبلوس", def:"https://picsum.photos/seed/LAU-beirut/800/450" },
  { short:"USJ",  name:"جامعة القديس يوسف",             region:"بيروت",          def:"https://picsum.photos/seed/USJ-beirut/800/450" },
  { short:"UL",   name:"الجامعة اللبنانية",             region:"كل لبنان",       def:"https://picsum.photos/seed/UL-lebanon/800/450" },
  { short:"USEK", name:"جامعة الروح القدس",             region:"جبل لبنان",      def:"https://picsum.photos/seed/USEK-kaslik/800/450" },
  { short:"UOB",  name:"جامعة البلمند",                 region:"الشمال",         def:"https://picsum.photos/seed/UOB-balamand/800/450" },
  { short:"NDU",  name:"جامعة سيدة اللويزة",            region:"جبل لبنان",      def:"https://picsum.photos/seed/NDU-louaize/800/450" },
  { short:"ESA",  name:"كلية إدارة الأعمال",            region:"بيروت",          def:"https://picsum.photos/seed/ESA-business/800/450" },
  { short:"UA",   name:"جامعة الأنطونية",               region:"بيروت",          def:"https://picsum.photos/seed/UA-antonine/800/450" },
  { short:"LIU",  name:"الجامعة اللبنانية الدولية",     region:"بيروت وفروع",   def:"https://picsum.photos/seed/LIU-international/800/450" },
  { short:"HU",   name:"جامعة هايكازيان",               region:"بيروت",          def:"https://picsum.photos/seed/HU-haigazian/800/450" },
  { short:"ALBA", name:"الأكاديمية اللبنانية للفنون",   region:"بيروت",          def:"https://picsum.photos/seed/ALBA-arts/800/450" },
  { short:"BAU",  name:"الجامعة العربية البيروتية",      region:"بيروت وطرابلس", def:"https://picsum.photos/seed/BAU-arab/800/450" },
  { short:"RHU",  name:"جامعة رفيق الحريري",            region:"بيروت",          def:"https://picsum.photos/seed/RHU-hariri/800/450" },
  { short:"IUL",  name:"الجامعة الإسلامية اللبنانية",   region:"البقاع",         def:"https://picsum.photos/seed/IUL-islamic/800/450" },
  { short:"LOU",  name:"الجامعة المفتوحة اللبنانية",    region:"كل لبنان",       def:"https://picsum.photos/seed/LOU-open/800/450" },
  { short:"MIU",  name:"جامعة المقاصد الإسلامية",       region:"بيروت",          def:"https://picsum.photos/seed/MIU-makassed/800/450" },
  { short:"GU",   name:"جامعة الجيل الجديد",            region:"بيروت",          def:"https://picsum.photos/seed/GU-jiil/800/450" },
  { short:"LNU",  name:"الجامعة اللبنانية الشمالية",    region:"الشمال",         def:"https://picsum.photos/seed/LNU-north/800/450" },
  { short:"SGU",  name:"جامعة القديس جرجس",             region:"الشمال",         def:"https://picsum.photos/seed/SGU-george/800/450" },
  { short:"BTU",  name:"جامعة الأعمال والتكنولوجيا",    region:"بيروت",          def:"https://picsum.photos/seed/BTU-business/800/450" },
  { short:"LSU",  name:"جامعة لبنان الجنوبية",          region:"الجنوب",         def:"https://picsum.photos/seed/LSU-south/800/450" },
];

const SCHOOL_LIST = [
  { id:"sc-cpf",   name:"Collège Protestant Français",           region:"بيروت",        def:"https://picsum.photos/seed/school-cpf/800/450" },
  { id:"sc-sjm",   name:"كوليج مار يوسف – الآباء اليسوعيون",   region:"الأشرفية",     def:"https://picsum.photos/seed/school-sjm/800/450" },
  { id:"sc-eng",   name:"مدرسة الإيفانجيليكال الوطنية",         region:"المزرعة",      def:"https://picsum.photos/seed/school-eng/800/450" },
  { id:"sc-lfb",   name:"Lycée Français de Beyrouth",            region:"الصنائع",      def:"https://picsum.photos/seed/school-lfb/800/450" },
  { id:"sc-acs",   name:"American Community School (ACS)",       region:"الحمرا",       def:"https://picsum.photos/seed/school-acs/800/450" },
  { id:"sc-ic",    name:"International College (IC)",             region:"الحمرا",       def:"https://picsum.photos/seed/school-ic/800/450" },
  { id:"sc-mbs",   name:"Makassed Blessed Philanthropic School", region:"طريق الجديدة", def:"https://picsum.photos/seed/school-mbs/800/450" },
  { id:"sc-hol",   name:"Holyfields International School",       region:"بيروت",        def:"https://picsum.photos/seed/school-hol/800/450" },
  { id:"sc-bhw",   name:"Brummana High School",                  region:"المتن",        def:"https://picsum.photos/seed/school-bhw/800/450" },
  { id:"sc-nd",    name:"Notre Dame de Jamhour",                 region:"جمهور",        def:"https://picsum.photos/seed/school-nd/800/450" },
];

type Section = "universities" | "schools" | "scholarships" | "blog" | "internships" | "settings";
type Row = Record<string, string | number | boolean | string[] | null>;

const CRUD: Record<string, {table:string;label:string;emoji:string;nameField:string;secField:string;fields:{key:string;label:string;type:string;required?:boolean}[]}> = {
  scholarships: {
    table:"scholarships", label:"المنح", emoji:"🏆", nameField:"name", secField:"provider",
    fields:[
      {key:"name",         label:"اسم المنحة",    type:"text",     required:true},
      {key:"provider",     label:"الجهة المانحة",  type:"text"},
      {key:"amount",       label:"المبلغ",         type:"text"},
      {key:"deadline",     label:"آخر موعد",      type:"text"},
      {key:"type",         label:"النوع",          type:"text"},
      {key:"region",       label:"المنطقة",        type:"text"},
      {key:"field",        label:"التخصص",         type:"text"},
      {key:"photo_url",    label:"صورة المنحة",    type:"url"},
      {key:"requirements", label:"شروط التقديم",  type:"textarea"},
      {key:"url",          label:"رابط التقديم",   type:"url"},
      {key:"description",  label:"وصف المنحة",    type:"textarea"},
    ]
  },
  blog: {
    table:"blog_posts", label:"المدونة", emoji:"📝", nameField:"title", secField:"category",
    fields:[
      {key:"title",     label:"عنوان المقال",  type:"text",     required:true},
      {key:"slug",      label:"الرابط (Slug)", type:"text",     required:true},
      {key:"excerpt",   label:"مقتطف قصير",   type:"textarea"},
      {key:"content",   label:"محتوى المقال", type:"textarea"},
      {key:"author",    label:"الكاتب",        type:"text"},
      {key:"category",  label:"الفئة",         type:"text"},
      {key:"image_url", label:"صورة المقال",   type:"url"},
      {key:"published", label:"نشر المقال",    type:"checkbox"},
    ]
  },
  internships: {
    table:"internships", label:"التدريب", emoji:"💼", nameField:"title", secField:"company",
    fields:[
      {key:"title",        label:"المسمى الوظيفي",  type:"text", required:true},
      {key:"company",      label:"اسم الشركة",       type:"text", required:true},
      {key:"location",     label:"المكان",            type:"text"},
      {key:"type",         label:"النوع",             type:"text"},
      {key:"field",        label:"المجال",            type:"text"},
      {key:"deadline",     label:"آخر موعد",         type:"text"},
      {key:"logo_url",     label:"شعار الشركة",      type:"url"},
      {key:"description",  label:"الوصف",             type:"textarea"},
      {key:"requirements", label:"المتطلبات",         type:"textarea"},
      {key:"url",          label:"رابط التقديم",     type:"url"},
    ]
  }
};

type ImgModal = {open:boolean; section:string; itemId:string; name:string; currentPhoto:string};

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [pw, setPw]           = useState("");
  const [pwErr, setPwErr]     = useState(false);
  const [section, setSection] = useState<Section>("universities");

  // Photo management
  const [uniPhotos,    setUniPhotos]    = useState<Record<string,string>>({});
  const [schoolPhotos, setSchoolPhotos] = useState<Record<string,string>>({});
  const [imgModal,     setImgModal]     = useState<ImgModal|null>(null);
  const [newPhoto,     setNewPhoto]     = useState("");
  const [photoMsg,     setPhotoMsg]     = useState("");

  // CRUD
  const [rows,     setRows]     = useState<Row[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState<Row>({});
  const [editId,   setEditId]   = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg,      setMsg]      = useState("");

  const fetchPhotos = useCallback(async (sec:string, setter:React.Dispatch<React.SetStateAction<Record<string,string>>>) => {
    const {data} = await supabase.from("site_images").select("item_id,photo_url").eq("section",sec);
    if (data) {
      const map:Record<string,string> = {};
      data.forEach(r => { map[r.item_id] = r.photo_url; });
      setter(map);
    }
  }, []);

  const fetchRows = useCallback(async (table:string) => {
    setLoading(true);
    const {data} = await supabase.from(table).select("*").order("id",{ascending:false});
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (section === "universities") fetchPhotos("universities", setUniPhotos);
    else if (section === "schools") fetchPhotos("schools", setSchoolPhotos);
    else if (section in CRUD) fetchRows(CRUD[section].table);
  }, [authed, section, fetchPhotos, fetchRows]);

  function login() {
    if (pw === ADMIN_KEY) { setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  }

  async function savePhoto() {
    if (!imgModal || !newPhoto.trim()) return;
    const {error} = await supabase.from("site_images").upsert(
      {section:imgModal.section, item_id:imgModal.itemId, photo_url:newPhoto.trim()},
      {onConflict:"section,item_id"}
    );
    if (error) { setPhotoMsg("❌ خطأ: "+error.message); }
    else {
      setPhotoMsg("✅ تم حفظ الصورة بنجاح!");
      setImgModal(null);
      if (imgModal.section==="universities") fetchPhotos("universities",setUniPhotos);
      else fetchPhotos("schools",setSchoolPhotos);
    }
    setTimeout(()=>setPhotoMsg(""),3000);
  }

  async function deletePhoto(sec:string, itemId:string) {
    await supabase.from("site_images").delete().eq("section",sec).eq("item_id",itemId);
    if (sec==="universities") fetchPhotos("universities",setUniPhotos);
    else fetchPhotos("schools",setSchoolPhotos);
    setImgModal(null);
    setPhotoMsg("✅ تم حذف الصورة المخصصة");
    setTimeout(()=>setPhotoMsg(""),3000);
  }

  function openAdd() { setForm({}); setEditId(null); setShowForm(true); }
  function openEdit(row:Row) { setForm({...row}); setEditId(row.id as number); setShowForm(true); }

  async function saveRow() {
    const cfg = CRUD[section];
    if (!cfg) return;
    const payload = {...form};
    delete payload.id; delete payload.created_at;
    let error;
    if (editId) ({ error } = await supabase.from(cfg.table).update(payload).eq("id",editId));
    else ({ error } = await supabase.from(cfg.table).insert(payload));
    if (error) { setMsg("❌ "+error.message); }
    else { setMsg("✅ تم الحفظ!"); setShowForm(false); fetchRows(cfg.table); }
    setTimeout(()=>setMsg(""),3000);
  }

  async function deleteRow(id:number) {
    const cfg = CRUD[section];
    if (!cfg || !confirm("هل أنت متأكد؟")) return;
    await supabase.from(cfg.table).delete().eq("id",id);
    fetchRows(cfg.table);
  }

  /* ─── LOGIN ─── */
  if (!authed) return (
    <div dir="rtl" className="min����͍ɕ�������Ʌ�����������ѕ�̵���ѕȁ���ѥ�䵍��ѕȁ��Ј�(�������؁�����9���􉉜�ݡ�є�ɽչ�����ᰁ����ܵ�ձ�����ܵʹ�͡���ܴ�ᰈ�(���������؁�����9����ѕ�е���ѕȁ���؈�(�����������؁�����9����ܴ�؁���؁�����Ք�����ɽչ�����ᰁ������ѕ�̵���ѕȁ���ѥ�䵍��ѕȁ�൅�Ѽ����Ё͡���ܵ����(�����������������������9����ѕ�еݡ�є�ѕ�д�ᰁ���е�������f������(����������𽑥��(�����������ā�����9����ѕ�д�ᰁ���е�����ѕ�е�Ʌ������ff#b�b��b�fb�b�b�b�b����(������������������9����ѕ�е�Ʌ�����ѕ�еʹ��дĈ�fb�b�b�f��P������A����������(��������𽑥��(�����������Ё���������ݽɐ��م�Ք�����(������������
���������͕�Aܡ��хɝ�йم�Ք��(������������-���ݸ�������������ѕȈ����������(����������������������fffb��b�ffb�f#bĈ(���������������9�����ܵ�ձ����ɑ�ȴȁɽչ����ᰁ��Ё��́ѕ�еʹ����́�������ѱ����������Ʌ�ͥѥ��������̀����������ɑ�ȵɕ���������ɕ�����艉�ɑ�ȵ�Ʌ����������鉽ɑ�ȵ��Ք���������(������������Ȁ�����������9����ѕ�еɕ������ѕ�еʹ�ѕ�е���ѕȁ���̈�fffb��b�ffb�f#băb�fb܃�v0����(�����������ѽ����
�����������􁍱���9����ܵ�ձ�������Ք�����ѕ�еݡ�є���́ɽչ����ᰁ���е�������ٕ�鉜���Ք������Ʌ�ͥѥ��������́͡���ܵʹ��(����������b�b�f#f(�����������ѽ��(������𽑥��(����𽑥��(����((������Ё��Ց
����͕�ѥ������
IU���
IUm͕�ѥ��t�聹ձ��((������R�R�R �M!	=I��R�R�R ���(��ɕ��ɸ��(�����؁�����Ѱ�������9���􉵥����͍ɕ�������Ʌ������������്����(������켨�!����Ȁ���(������񡕅��ȁ�����9���􉉜��Ʌ�����ѕ�еݡ�є���؁��Ё������ѕ�̵���ѕȁ���ѥ�䵉��ݕ���͡ɥ������(���������؁�����9���􉙱����ѕ�̵���ѕȁ����̈�(�����������؁�����9����ܴ䁠�䁉����Ք�����ɽչ�������������ѕ�̵���ѕȁ���ѥ�䵍��ѕȈ�(�����������������������9���􉙽�е������ѕ�е���ѕ�еݡ�є��f������(����������𽑥��(�������������(�����������������������9����ѕ�е��Ք��������е�����ѕ�е����fb�b�b�f������(�����������������������9����ѕ�е�Ʌ�����ѕ�е�́�ȴȈ������A�������������(����������𽑥��(��������𽑥��(�����������ѽ����
�����젤��͕��ѡ������͔�􁍱���9����ѕ�е�Ʌ�������ٕ��ѕ�еݡ�є�ѕ�еʹ���ɑ�ȁ��ɑ�ȵ�Ʌ�������́��ĸԁɽչ���������ٕ�鉽ɑ�ȵ�Ʌ������Ʌ�ͥѥ��������̈�(����������b�b�f#b�(�����������ѽ��(������𽡕�����((�������؁�����9���􉙱�������ā�ٕə��ܵ��������(��������켨�M�����Ȁ���(���������ͥ��������9����ܴ�؁���ݡ�є���ɑ�ȵ����ɑ�ȵ�Ʌ�������������്�����Ё͡ɥ�����͡���ܵʹ��(������������������9����ѕ�е�́ѕ�е�Ʌ��������́���е͕�����������ɍ�͔��Ʌ������ݥ���Ё��Ĉ�b�fb�fb�b�f���(�����������l(����������������չ�ٕ�ͥѥ�̈��������b�fb�b�fb�b�b���������������~>o��<���(����������������͍����̈�������������b�ffb�b�b�b̈��������������~>����(����������������͍�����͡��̈��������b�fffb������������������~>���(���������������艉��������������������b�ffb�f#fb����������������~Nt���(���������������艥�ѕɹ͡��̈���������b�fb�b�b�f+b����������������~J����(����������������͕�ѥ��̈������������b�fb�b�b�b�b�b�b������������苊jg��<���(����������t���������(���������������ѽ�������̹���(����������������
�����젤���͕�M��ѥ���̹����́M��ѥ����͕�M����ɴ����͔����(�������������������9�����ܵ�ձ��ѕ�еɥ��Ё������ѕ�̵���ѕȁ����ȸԁ��́��ȸԁɽչ����ᰁѕ�еʹ����ā���е����մ��Ʌ�ͥѥ���������͕�ѥ�����̹���������Ք�����ѕ�еݡ�є�͡���ܵ����ѕ�е�Ʌ�������ٕ�鉜��Ʌ���������(�������������������������9����ѕ�е�����̹������������(���������������������̹������������(���������������͕�ѥ�����̹�����������������9����ȵ��Ѽ�ܴȁ��ȁɽչ�����ձ�������Ք��������(���������������ѽ��(�������������(���������ͥ���((��������켨�5�������(��������񵅥�������9���􉙱��ā��؁�ٕə��ܵ䵅�Ѽ��(������������͜�����؁�����9���􉵈�Ё����ɕ��������ɑ�ȁ��ɑ�ȵ�ɕ�������ѕ�е�ɕ���������Ё��́ɽչ����ᰁѕ�еʹ����е����մ����͝�𽑥���(��������������ѽ5͜�����؁�����9���􉵈�Ё�����Ք������ɑ�ȁ��ɑ�ȵ��Ք�����ѕ�е��Ք�������Ё��́ɽչ����ᰁѕ�еʹ����е����մ������ѽ5͝�𽑥���((����������켨��VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@(��������������U9%YIM%Q%L�A!=Q<�59H(�����������VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@����(�����������͕�ѥ�����չ�ٕ�ͥѥ�̈�����(���������������(���������������؁�����9���􉙱����ѕ�̵���ѕȁ���ѥ�䵉��ݕ������؈�(�������������������(�������������������ȁ�����9����ѕ�д�ᰁ���е�����ѕ�е�Ʌ�������~>o��<�b�b�b�b�b��b�f#băb�fb�b�fb�b�b����(��������������������������9����ѕ�е�Ʌ�����ѕ�еʹ��дĈ�b�b�b�b܃b�ff$�b�f(�b�b�fb�b��fb�b�f+f+băb�f#b�b�fb���P�b�fb�b�f+f+b�b�b��b�b�fbăff#b�b�f,�b�ff$�b�fff#fb����(����������������𽑥��(�����������������؁�����9���􉙱����ѕ�̵���ѕȁ����ȁ�����Ք������ɑ�ȁ��ɑ�ȵ��Ք�������́��ĸԁɽչ��������(�����������������������������9����ѕ�е��Ք�����ѕ�е�́���е͕��������(���������������������=����й���̡չ�A��ѽ̤�����ѡ�b�f#băfb�b�b�b�(������������������������(����������������𽑥��(��������������𽑥��((���������������؁�����9����ɥ���ɥ�����̴ȁ���ɥ�����̴́��ɥ�����̴Ё����Ј�(�����������������U9%}1%MP�����չ����(����������������������Ё���Ѽ��չ�A��ѽ�mչ��͡���t����չ������(����������������������Ё���
��ѽ��􀄅չ�A��ѽ�mչ��͡���t�(������������������ɕ��ɸ��(���������������������؁�����չ��͡����(���������������������������9���􉉜�ݡ�є�ɽչ�����ᰁ��ɑ�ȁ��ɑ�ȵ�Ʌ������ٕə��ܵ�������͡���ܵʹ���ٕ��͡���ܵ����Ʌ�ͥѥ����������ͽȵ����ѕȁ�ɽ���(������������������������
�����젤���͕�%��5�������������Ք�͕�ѥ���չ�ٕ�ͥѥ�̈��ѕ�%��չ��͡��б�����չ����������ɕ��A��Ѽ����ѽ���͕�9��A��Ѽ�չ�A��ѽ�mչ��͡���u���������(�����������������������؁�����9����ɕ��ѥٔ����������Ʌ������ٕə��ܵ��������(������������������������񥵜��Ɍ�����ѽ􁅱���չ�������(�������������������������������9����ܵ�ձ�����ձ�������е��ٕȁ�ɽ�����ٕ��͍������ԁ�Ʌ�ͥѥ����Ʌ�͙�ɴ���Ʌѥ�������(�����������������������������ɽ�����졔�хɝ�Ё�́!Q51%���������Ф��Ɍ�չ���������(�������������������������؁�����9���􉅉ͽ��є���͕д������Ʌ����еѼ�Ё�ɽ�����������٥�����������Ѽ��Ʌ����ɕ�Ј��(�������������������������؁�����9���􉅉ͽ��є����ѽ��ȁɥ��дȸԁ���дȸԁ������ѕ�̵�������ѥ�䵉��ݕ����(�������������������������������������9����ѕ�еݡ�є����е���Ʌ�����ѕ�еʹ��ɽ��͡���܈��չ��͡����������(������������������������������
��ѽ����������������9����ѕ�е�́����ɕ�������ѕ�еݡ�є���ĸԁ����ԁɽչ�����ձ�����е͕���������rL�������(������������������������𽑥��(�������������������������؁�����9���􉅉ͽ��є�ѽ��ȁ���дȁ����������ɽ�����ٕ�������������Ʌ�ͥѥ�����������(���������������������������؁�����9���􉉜�ݡ�є���������ɽ�����ȵʹ�ѕ�е�Ʌ�����ѕ�е�́���е�������ȁ��āɽչ�������͡���܈��~N܃b�b�b�f+f𽑥��(������������������������𽑥��(����������������������𽑥��(�����������������������؁�����9������̈�(��������������������������������9���􉙽�е͕�������ѕ�е�Ʌ�����ѕ�е�́��������ѥ��Ё�����������ȁ���Ĉ��չ����������(��������������������������������9����ѕ�е�́ѕ�е�Ʌ�������չ��ɕ��������(����������������������𽑥��(��������������������𽑥��(��������������������(�������������������(��������������𽑥��(������������𽑥��(������������((����������켨��VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@(��������������M
!==1L�A!=Q<�59H(�����������VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@����(�����������͕�ѥ�����͍����̈�����(���������������(���������������؁�����9���􉙱����ѕ�̵���ѕȁ���ѥ�䵉��ݕ������؈�(�������������������(�������������������ȁ�����9����ѕ�д�ᰁ���е�����ѕ�е�Ʌ�������~>��b�b�b�b�b��b�f#băb�ffb�b�b�b����(��������������������������9����ѕ�е�Ʌ�����ѕ�еʹ��дĈ�b�b�b�b܃b�ff$�b�f(�fb�b�b�b��fb�b�f+f+băb�f#b�b�fb����(����������������𽑥��(�����������������؁�����9���􉙱����ѕ�̵���ѕȁ����ȁ�����Ք������ɑ�ȁ��ɑ�ȵ��Ք�������́��ĸԁɽչ��������(�����������������������������9����ѕ�е��Ք�����ѕ�е�́���е͕���������=����й���̡͍����A��ѽ̤�����ѡ�b�f#băfb�b�b�b�������(����������������𽑥��(��������������𽑥��(���������������؁�����9����ɥ���ɥ�����̴ȁ���ɥ�����̴́��ɥ�����̴Ё����Ј�(�����������������M
!==1}1%MP�����͌���(����������������������Ё���Ѽ��͍����A��ѽ�m͌���t����͌�����(����������������������Ё���
��ѽ��􀄅͍����A��ѽ�m͌���t�(������������������ɕ��ɸ��(���������������������؁�����͌����(���������������������������9���􉉜�ݡ�є�ɽչ�����ᰁ��ɑ�ȁ��ɑ�ȵ�Ʌ������ٕə��ܵ�������͡���ܵʹ���ٕ��͡���ܵ����Ʌ�ͥѥ����������ͽȵ����ѕȁ�ɽ���(������������������������
�����젤���͕�%��5�������������Ք�͕�ѥ���͍����̈��ѕ�%��͌���������͌���������ɕ��A��Ѽ����ѽ���͕�9��A��Ѽ�͍����A��ѽ�m͌���u���������(�����������������������؁�����9����ɕ��ѥٔ����������Ʌ������ٕə��ܵ��������(������������������������񥵜��Ɍ�����ѽ􁅱���͌�����􁍱���9����ܵ�ձ�����ձ�������е��ٕȁ�ɽ�����ٕ��͍������ԁ�Ʌ�ͥѥ����Ʌ�͙�ɴ���Ʌѥ�����������ɽ�����졔�хɝ�Ё�́!Q51%���������Ф��Ɍ�͌���������(�������������������������؁�����9���􉅉ͽ��є���͕д������Ʌ����еѼ�Ё�ɽ�����������٥�����������Ѽ��Ʌ����ɕ�Ј��(�������������������������؁�����9���􉅉ͽ��є����ѽ��ȁɥ��дȸԁ���дȸԁ������ѕ�̵�������ѥ�䵉��ݕ����(�������������������������������������9����ѕ�еݡ�є����е�����ѕ�е�́�ɽ��͡���܁��չ��є���͌�������Չ��ɥ���������������(������������������������������
��ѽ����������������9����ѕ�е�́����ɕ�������ѕ�еݡ�є���ĸԁ����ԁɽչ�����ձ�����е͕���������rL�������(������������������������𽑥��(�������������������������؁�����9���􉅉ͽ��є�ѽ��ȁ���дȁ����������ɽ�����ٕ�������������Ʌ�ͥѥ�����������(���������������������������؁�����9���􉉜�ݡ�є���������ɽ�����ȵʹ�ѕ�е�Ʌ�����ѕ�е�́���е�������ȁ��āɽչ�������͡���܈��~N܃b�b�b�f+f𽑥��(������������������������𽑥��(����������������������𽑥��(�����������������������؁�����9������̈�(��������������������������������9���􉙽�е͕�������ѕ�е�Ʌ�����ѕ�е�́��������ѥ��Ё�����������ȁ���Ĉ��͌���������(��������������������������������9����ѕ�е�́ѕ�е�Ʌ�������͌�ɕ��������(����������������������𽑥��(��������������������𽑥��(��������������������(�������������������(��������������𽑥��(������������𽑥��(������������((����������켨��VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@(��������������
IU�M
Q%=9L(�����������VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�VC�V@����(������������Ց
�������(���������������(���������������؁�����9���􉙱����ѕ�̵���ѕȁ���ѥ�䵉��ݕ������؈�(�������������������(�������������������ȁ�����9����ѕ�д�ᰁ���е�����ѕ�е�Ʌ��������Ց
�����������Ց
������������(��������������������������9����ѕ�е�Ʌ�����ѕ�еʹ��дĈ��ɽ�̹����ѡ�b�fb�băff(�fb�b�b�b��b�fb�f+b�fb�b����(����������������𽑥��(�������������������ѽ����
������������􁍱���9���􉉜���Ք�����ѕ�еݡ�є���ԁ��ȸԁɽչ����ᰁѕ�еʹ����е�������ٕ�鉜���Ք������Ʌ�ͥѥ��������́͡���ܵʹ�������ѕ�̵���ѕȁ����Ȉ�(��������������������b�b�b�fb��b�b�f+b�(�������������������ѽ��(��������������𽑥��((��������������켨��ɴ����(���������������͡���ɴ�����(�����������������؁�����9���􉉜�ݡ�є�ɽչ�����ᰁ��ɑ�ȁ��ɑ�ȵ�Ʌ�������؁���؁͡���ܵʹ��(�������������������́�����9���􉙽�е�����ѕ�е�Ʌ��������ԁѕ�е���������ѕ�̵���ѕȁ����Ȉ�(��������������������핑��%����r?��<�b�b�b�f+f�苊zT�b�b�b�fb�����Ց
���������(���������������������(�������������������؁�����9����ɥ���ɥ�����̴ā���ɥ�����̴ȁ����Ј�(����������������������Ց
��������̹��������(�����������������������؁����혹���􁍱���9����혹�������ѕ�хɕ������鍽�������Ȉ舉��(������������������������񱅉��������9���􉉱����ѕ�е�́���е͕�������ѕ�е�Ʌ��������ĸԈ�혹������혹ɕ�եɕ��������𽱅����(������������������������혹�������ѕ�хɕ������(���������������������������ѕ�хɕ��م�Ք�졙�ɵm�����t��́��ɥ�������􁽹
���������͕��ɴ�츸���ɴ�m�����t锹хɝ�йم�Օ���(����������������������������ɽ�����􁍱���9����ܵ�ձ����ɑ�ȁ��ɑ�ȵ�Ʌ�����ɽչ����ᰁ��́��ȸԁѕ�еʹ��������line-none focus:border-blue-500 resize-none transition-colors"/>
                        ) : f.type==="checkbox" ? (
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input type="checkbox" checked={!!form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.checked})}
                              className="w-4 h-4 accent-blue-600"/>
                            <span className="text-sm text-gray-600">منشور</span>
                          </label>
                        ) : (
                          <div>
                            <input type={f.type} value={(form[f.key] as string)||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"/>
                            {f.type==="url" && form[f.key] && (
                              <img src={form[f.key] as string} alt="preview" className="mt-2 rounded-xl h-24 object-cover border border-gray-200"
                                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button onClick={saveRow} className="bg-blue-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">💾 حفظ</button>
                    <button onClick={()=>setShowForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
                  </div>
                </div>
              )}

              {/* Table */}
              {loading ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4 animate-spin">⟳</div>
                  <p className="font-medium">جارٍ التحميل...</p>
                </div>
              ) : rows.length===0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200">
                  <div className="text-5xl mb-4">{crudCfg.emoji}</div>
                  <p className="text-lg font-semibold">لا توجد بيانات بعد</p>
                  <p className="text-sm mt-1">اضغط "إصافة جديد" للبدء</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase">#</th>
                          <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase">العنوان / الاسم</th>
                          <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase">التفاصيل</th>
                          <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row,i)=>(
                          <tr key={row.id as number} className={`border-b border-gray-100 hover:bg-blue-50/20 transition-colors ${i%2===0?"bg-white":"bg-gray-50/30"}`}>
                            <td className="px-5 py-3.5 text-gray-400 text-xs font-medium">{row.id as number}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {(row.photo_url||row.image_url||row.logo_url) && (
                                  <img src={(row.photo_url||row.image_url||row.logo_url) as string} alt=""
                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200"
                                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                                )}
                                <span className="font-semibold text-gray-800 max-w-xs truncate">
                                  {(row[crudCfg.nameField]||row.title||row.name) as string}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">
                              {section==="blog" ? (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.published?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                                  {row.published?"✓ منشور":"مسودة"}
                                </span>
                              ) : (
                                <span>{(row[crudCfg.secField]) as string || "—"}</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex gap-3">
                                <button onClick={()=>openEdit(row)} className="text-blue-500 hover:text-blue-700 text-xs font-bold hover:underline transition-colors">تعديل</button>
                                <button onClick={()=>deleteRow(row.id as number)} className="text-red-400 hover:text-red-600 text-xs font-bold hover:underline transition-colors">حذف</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              SETTINGS
          ══════════════════════════════════════ */}
          {section==="settings" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ إعدادات الموقع</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-700 font-semibold text-sm">🔑 كلمة مرور الأدمن</p>
                    <p className="text-blue-600 text-xs mt-1">يمكن تغييرها من كود المشروع في الملف <code className="bg-blue-100 px-1 rounded">src/app/admin/page.tsx</code> — متغير <code className="bg-blue-100 px-1 rounded">ADMIN_KEY</code></p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-700 font-semibold text-sm">📊 قاعدة البيانا֪ (Supabase)</p>
                    <p className="text-amber-600 text-xs mt-1">المشروع: <strong>cxctwvqqnpvoebpelkle</strong> — الجداول: universities، scholarships، blog_posts، internships، site_images</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-semibold text-sm">🚀 النشر (Vercel)</p>
                    <p className="text-green-600 text-xs mt-1">أي تغيير على GitHub يُنشر تلقائياً على Vercel خلال دقيقة</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════
          PHOTO EDIT MODAL
      ══════════════════════════════════════ */}
      {imgModal?.open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">📷 تغيير صورة</h3>
              <button onClick={()=>setImgModal(null)} className="text-gray-400 hover:text-white text-2xl leading-none transition-colors">×</button>
            </div>
            <div className="p-6">
              <p className="font-semibold text-gray-700 mb-4 text-sm">{imgModal.name}</p>

              {/* Before/After */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase">الصورة الحالية</p>
                  <div className="rounded-xl overflow-hidden h-32 bg-gray-100 border border-gray-200">
                    <img src={imgModal.currentPhoto} alt="" className="w-full h-full object-cover"/>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase">معاينة الجديدة</p>
                  <div className="rounded-xl overflow-hidden h-32 bg-gray-100 border border-gray-200">
                    {newPhoto ? (
                      <img src={newPhoto} alt="preview" className="w-full h-full object-cover"
                        onError={e=>{(e.target as HTMLImageElement).src=imgModal.currentPhoto;}}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        أدخل رابط الصورة للمعاينة
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 mb-2">رابط الصورة الجديدة *</label>
                <input type="url" value={newPhoto} onChange={e=>setNewPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/... أو https://picsum.photos/seed/.../800/450"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"/>
                <p className="text-xs text-gray-400 mt-1.5">
                  💡 Unsplash: <code className="bg-gray-100 px-1 rounded text-xs">images.unsplash.com/photo-ID?w=800</code>
                  &nbsp;|&nbsp; Picsum: <code className="bg-gray-100 px-1 rounded text-xs">picsum.photos/seed/WORD/800/450</code>
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={savePhoto} disabled={!newPhoto.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                  💾 حفظ الصورة
                </button>
                {(imgModal.section==="universities"?uniPhotos:schoolPhotos)[imgModal.itemId] && (
                  <button onClick={()=>deletePhoto(imgModal.section, imgModal.itemId)}
                    className="px-4 py-3 border-2 border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                    🗑️
                  </button>
                )}
                <button onClick={()=>setImgModal(null)}
                  className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
