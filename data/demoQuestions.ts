import type { Question } from '../types';

// FIX: Replaced placeholder content with actual demo questions to make this a valid module.
export const demoQuestions: Record<string, Question[]> = {
  'social-studies': [
    {
      id: 101,
      type: 'quiz',
      grade: 5,
      topic: 'Birey ve Toplum',
      difficulty: 'kolay',
      kazanımId: 'SB.5.1.4',
      subjectId: 'social-studies',
      question: 'Aşağıdakilerden hangisi çocuk haklarından biri değildir?',
      options: ['Eğitim hakkı', 'Sağlık hakkı', 'Oyun oynama hakkı', 'Araba kullanma hakkı'],
      answer: 'Araba kullanma hakkı',
      explanation: 'Çocukların araba kullanma ehliyeti ve hakkı yoktur; bu yetişkinlere ait bir haktır. Diğer seçenekler temel çocuk haklarındandır.'
    },
    {
      id: 102,
      type: 'quiz',
      grade: 5,
      topic: 'Kültür ve Miras',
      difficulty: 'orta',
      kazanımId: 'SB.5.2.1',
      subjectId: 'social-studies',
      question: 'Yazıyı icat ederek insanlık tarihine önemli bir katkıda bulunan Mezopotamya uygarlığı aşağıdakilerden hangisidir?',
      options: ['Sümerler', 'Hititler', 'Urartular', 'Frigler'],
      answer: 'Sümerler',
      explanation: 'Sümerler, çivi yazısını icat ederek tarihin yazılı dönemini başlatan önemli bir Mezopotamya uygarlığıdır.'
    },
  ],
  'math': [
      {
          id: 201,
          type: 'quiz',
          grade: 8,
          topic: 'Sayılar ve İşlemler',
          difficulty: 'kolay',
          kazanımId: 'M.8.1.1.1',
          subjectId: 'math',
          question: '12 sayısının pozitif tam sayı bölenleri aşağıdakilerden hangisinde doğru verilmiştir?',
          options: ['1, 2, 3, 4, 6, 12', '1, 2, 3, 4, 8, 12', '1, 2, 4, 6, 12', '1, 3, 4, 6, 12'],
          answer: '1, 2, 3, 4, 6, 12',
          explanation: '12\'yi tam bölen sayılar 1, 2, 3, 4, 6 ve 12\'dir.'
      }
  ],
  'science': [
    {
      id: 301,
      type: 'quiz',
      grade: 5,
      topic: 'GÜNEŞ, DÜNYA VE AY',
      difficulty: 'kolay',
      kazanımId: 'F.5.1.1.1.',
      subjectId: 'science',
      question: 'Güneş\'in katmanlardan oluştuğu düşünüldüğünde, yüzeyinde daha soğuk olan bölgelere ne ad verilir?',
      options: ['Güneş lekesi', 'Güneş rüzgarı', 'Korona', 'Çekirdek'],
      answer: 'Güneş lekesi',
      explanation: 'Güneş lekeleri, çevresindeki bölgelere göre daha soğuk oldukları için daha koyu renkte görünen alanlardır.'
    }
  ],
  'turkish': [
    {
      id: 401,
      type: 'quiz',
      grade: 5,
      topic: 'OKUMA',
      difficulty: 'kolay',
      kazanımId: 'T.5.1.5.',
      subjectId: 'turkish',
      question: '"Bu kadar işin arasında bir de yeni projeye başlamak gözümü korkuttu." cümlesindeki altı çizili deyimin anlamı nedir?',
      options: ['Bir işi yapmaktan çekinmek, zor geleceğini düşünmek', 'Çok sevinmek', 'Gözleri ağrımak', 'Bir şeyi görememek'],
      answer: 'Bir işi yapmaktan çekinmek, zor geleceğini düşünmek',
      explanation: '"Gözü korkmak" deyimi, bir işin zorluğundan veya tehlikesinden çekinmek, o işi yapmaya cesaret edememek anlamına gelir.'
    }
  ],
  'english': [
    {
      id: 501,
      type: 'quiz',
      grade: 5,
      topic: 'THEME 1: SCHOOL LIFE',
      difficulty: 'kolay',
      kazanımId: 'ENG.5.1.V1',
      subjectId: 'english',
      question: 'Which one is NOT a school subject?',
      options: ['Math', 'Science', 'Art', 'Lunch'],
      answer: 'Lunch',
      explanation: 'Lunch is the meal you eat in the middle of the day. Math, Science, and Art are school subjects.'
    }
  ],
  'paragraph': [
    {
      id: 601,
      type: 'quiz',
      grade: 5,
      topic: 'Paragraf Becerileri',
      difficulty: 'kolay',
      kazanımId: 'PAR.5.1',
      subjectId: 'paragraph',
      question: 'Kitap okumak, kelime dağarcığımızı zenginleştirir ve hayal gücümüzü geliştirir. Farklı dünyalara kapı aralar, yeni karakterlerle tanışmamızı sağlar. Bu yüzden boş zamanlarımızı kitap okuyarak değerlendirmek çok faydalıdır.\n\nBu paragrafın ana fikri aşağıdakilerden hangisidir?',
      options: [
        'Kitap okumak çok yönlü bir gelişim sağlar.',
        'Boş zamanlarda sadece kitap okunmalıdır.',
        'Hayal gücü en önemli yeteneğimizdir.',
        'Herkesin bir kütüphanesi olmalıdır.'
      ],
      answer: 'Kitap okumak çok yönlü bir gelişim sağlar.',
      explanation: 'Paragrafta kitap okumanın kelime dağarcığına, hayal gücüne olan faydalarından bahsedilerek genel olarak gelişim sağladığı vurgulanmaktadır.'
    }
  ],
};
