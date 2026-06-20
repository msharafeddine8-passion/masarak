/**
 * ClassicTemplate — قالب PDF الكلاسيكي لمسارك
 *
 * يُعرض على السيرفر فقط (Node.js runtime) عبر @react-pdf/renderer.
 * يدعم العربية بخط Tajawal المسجَّل من Google Fonts.
 *
 * الهيكل:
 *  - Header: شعار + Masarak ID + اسم الطالب
 *  - Info row: المستوى / الدولة / سنة الميلاد / DNA
 *  - Divider
 *  - Sections: education / certificate / achievement / skill / language / volunteer
 *  - Footer: QR URL + masaraklb.com
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer';

// ─── Font registration ────────────────────────────────────────────────────────
// Tajawal from Google Fonts CDN — supports Arabic + Latin
Font.register({
  family: 'Tajawal',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/tajawal/v4/Iura6YBj_oCad4k1l1uq.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/tajawal/v4/Iura6YBj_oCad4k1nzSBDespuAIp.woff2',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/tajawal/v4/Iura6YBj_oCad4k1pTWi3sqZuA.woff2',
      fontWeight: 800,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]); // disable hyphenation for Arabic

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  navy:       '#0F172A',
  navyLight:  '#1E293B',
  gold:       '#D4AF37',
  goldLight:  '#F5D76E',
  white:      '#FFFFFF',
  slate300:   '#CBD5E1',
  slate400:   '#94A3B8',
  slate500:   '#64748B',
  teal:       '#5EEAD4',
  bg:         '#F8FAFC',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Tajawal',
    backgroundColor: C.bg,
    padding: 0,
    direction: 'rtl',
  },

  // ── Header (navy banner) ──────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    padding: '28 32 24',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#0F4A52',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1 solid rgba(212,175,55,0.4)',
  },
  logoText: {
    color: C.gold,
    fontSize: 16,
    fontWeight: 700,
  },
  brandName: {
    color: C.white,
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 1,
  },
  idBadge: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    border: '1 solid rgba(212,175,55,0.4)',
    borderRadius: 6,
    padding: '4 12',
    alignItems: 'flex-end',
  },
  idLabel: {
    color: C.slate400,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  idValue: {
    color: C.gold,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.5,
  },
  goldStripe: {
    height: 2,
    backgroundColor: C.gold,
  },

  // ── Student name block ────────────────────────────────────────────────────
  nameBlock: {
    backgroundColor: C.navyLight,
    padding: '16 32 20',
    alignItems: 'flex-end',
  },
  nameAr: {
    color: C.white,
    fontSize: 22,
    fontWeight: 800,
    textAlign: 'right',
  },
  nameEn: {
    color: C.slate400,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Info chips row ────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row-reverse',
    padding: '14 32',
    gap: 10,
    flexWrap: 'wrap',
    borderBottom: `1 solid ${C.slate300}`,
    backgroundColor: C.white,
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 700,
  },
  dnaRow: {
    flexDirection: 'row-reverse',
    padding: '10 32 14',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.white,
    borderBottom: `1 solid ${C.slate300}`,
  },
  dnaLabel: {
    fontSize: 9,
    color: C.slate400,
  },
  dnaValue: {
    fontSize: 11,
    color: C.teal,
    fontWeight: 700,
  },

  // ── Section container ─────────────────────────────────────────────────────
  body: {
    padding: '20 32 0',
    backgroundColor: C.bg,
  },
  sectionTitle: {
    color: C.slate500,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'right',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1 solid ${C.slate300}`,
  },
  sectionGroup: {
    marginBottom: 18,
  },
  entryCard: {
    backgroundColor: C.white,
    borderRadius: 8,
    border: `1 solid ${C.slate300}`,
    padding: '10 14',
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  entryTitle: {
    color: C.navy,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'right',
  },
  entrySubtitle: {
    color: C.slate500,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 2,
  },
  entryDate: {
    color: C.slate400,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 3,
  },
  entryDesc: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 1.5,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: C.navy,
    padding: '12 32',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  footerUrl: {
    color: C.slate400,
    fontSize: 9,
  },
  footerBrand: {
    color: C.gold,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 2,
  },
});

// ─── Label maps ───────────────────────────────────────────────────────────────

const LEVEL_AR: Record<string, string> = {
  secondary:  'ثانوي',
  university: 'جامعي',
  graduate:   'خريج',
};

const COUNTRY_AR: Record<string, string> = {
  LB: 'لبنان', SA: 'السعودية', AE: 'الإمارات', JO: 'الأردن',
  EG: 'مصر', KW: 'الكويت', QA: 'قطر', BH: 'البحرين',
  OM: 'عُمان', IQ: 'العراق', SY: 'سوريا', MA: 'المغرب',
  DZ: 'الجزائر', TN: 'تونس', LY: 'ليبيا', SD: 'السودان',
  YE: 'اليمن', PS: 'فلسطين',
};

const SECTION_LABELS: Record<string, string> = {
  education:   'التعليم',
  certificate: 'الشهادات والدورات',
  achievement: 'الإنجازات',
  skill:       'المهارات',
  language:    'اللغات',
  volunteer:   'التطوع والنشاط',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PDFCardData {
  masarak_id: string;
  display_name_ar?: string | null;
  display_name_en?: string | null;
  birth_year?: number | null;
  study_level?: string | null;
  created_at: string;
}

export interface PDFProfileData {
  country?: string | null;
  career_dna_result?: string | null;
  full_name?: string | null;
}

export interface PDFSection {
  id: number;
  section_type: string;
  title: string;
  subtitle?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  description?: string | null;
}

interface Props {
  card: PDFCardData;
  profile: PDFProfileData;
  sections: PDFSection[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClassicTemplate({ card, profile, sections }: Props) {
  const nameAr = card.display_name_ar || profile.full_name || 'الطالب';
  const nameEn = card.display_name_en || '';
  const level   = LEVEL_AR[card.study_level || ''] || '';
  const country = COUNTRY_AR[profile.country || ''] || profile.country || '';
  const dna     = profile.career_dna_result || '';
  const publicUrl = `https://masaraklb.com/v/${card.masarak_id}`;

  // Group sections by type, maintaining logical order
  const ORDER = ['education', 'certificate', 'achievement', 'skill', 'language', 'volunteer'];
  const grouped = groupBy(sections, (s) => s.section_type);
  const sectionTypes = ORDER.filter((t) => grouped[t]?.length);

  return (
    <Document
      title={`ملف ${nameAr} — مسارك`}
      author="مسارك"
      creator="masaraklb.com"
      language="ar"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Gold top stripe ── */}
        <View style={styles.goldStripe} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>م</Text>
            </View>
            <Text style={styles.brandName}>مسارك</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idLabel}>Masarak ID</Text>
            <Text style={styles.idValue}>{card.masarak_id}</Text>
          </View>
        </View>

        {/* ── Name ── */}
        <View style={styles.nameBlock}>
          <Text style={styles.nameAr}>{nameAr}</Text>
          {nameEn ? <Text style={styles.nameEn}>{nameEn}</Text> : null}
        </View>

        {/* ── Gold stripe ── */}
        <View style={styles.goldStripe} />

        {/* ── Info chips ── */}
        <View style={styles.infoRow}>
          {level ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>🎓 {level}</Text>
            </View>
          ) : null}
          {country ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>🌍 {country}</Text>
            </View>
          ) : null}
          {card.birth_year ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>📅 {card.birth_year}</Text>
            </View>
          ) : null}
        </View>

        {/* ── DNA ── */}
        {dna ? (
          <View style={styles.dnaRow}>
            <Text style={styles.dnaLabel}>المسار المهني: </Text>
            <Text style={styles.dnaValue}>{dna}</Text>
          </View>
        ) : null}

        {/* ── Sections ── */}
        <View style={styles.body}>
          {sectionTypes.length === 0 ? (
            <View style={{ padding: '20 0', alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                لم يُضف الطالب أي أقسام بعد
              </Text>
            </View>
          ) : (
            sectionTypes.map((type) => (
              <View key={type} style={styles.sectionGroup} wrap={false}>
                <Text style={styles.sectionTitle}>
                  {SECTION_LABELS[type] || type}
                </Text>
                {grouped[type].map((s) => (
                  <View key={s.id} style={styles.entryCard}>
                    <Text style={styles.entryTitle}>{s.title}</Text>
                    {s.subtitle ? (
                      <Text style={styles.entrySubtitle}>{s.subtitle}</Text>
                    ) : null}
                    {(s.date_from || s.date_to) ? (
                      <Text style={styles.entryDate}>
                        {[s.date_from, s.date_to].filter(Boolean).join(' — ')}
                      </Text>
                    ) : null}
                    {s.description ? (
                      <Text style={styles.entryDesc}>{s.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Link src={publicUrl} style={styles.footerUrl}>
            {publicUrl}
          </Link>
          <Text style={styles.footerBrand}>مسارك</Text>
        </View>

      </Page>
    </Document>
  );
}
