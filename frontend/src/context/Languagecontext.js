import React, { createContext, useContext, useState } from "react";

const translations = {
  en: {
    home: "Home",
    events: "Events",
    checkStatus: "Check Status",
    results: "Results",
    adminLogin: "Admin Login",
    logout: "Logout",

    officialPortal: "Official Dhaham School Event Portal — Sri Lanka",
    heroTitle: "Dhaham School Event Management System",
    heroDesc:
      "Students can apply directly for events — no account needed. Admin manages schools and approves applications.",
    browseEvents: "Browse All Events",
    checkMyStatus: "Check My Status",
    viewResults: "View Results",

    howItWorks: "How It Works",
    step1Title: "Browse Events",
    step1Desc: "Find school, zonal or provincial events",
    step2Title: "Click Apply Now",
    step2Desc: "A form opens — no login needed",
    step3Title: "Upload Documents",
    step3Desc: "Photo and birth certificate PDF",
    step4Title: "Get Notified",
    step4Desc: "Email and SMS after admin decision",

    grades: "Grades",
    eventTypes: "Event Types",
    islandWide: "Island Wide",
    allZones: "All Zones",
    levels: "3 Levels",

    announcements: "Announcements",
    noAnnouncements: "No announcements at this time.",

    upcomingEvents: "Upcoming Events",
    viewAll: "View All",
    applyNow: "Apply Now",
    noEvents: "No upcoming events.",
    deadline: "Deadline",
    venue: "Venue",
    eventDate: "Date",
    noAccountNeeded:
      "✅ No account needed — click Apply Now on any event to apply directly!",
    closedEvent: "Closed",

    eventsTitle: "Events",
    eventsDesc:
      "Browse and apply for events. Click Apply Now — no account needed!",
    search: "Search",
    searchEvents: "Search events...",
    eventType: "Event Type",
    allTypes: "All Types",
    grade: "Grade",
    allGrades: "All Grades",
    clear: "Clear",
    viewDetails: "View Details",
    noEventsFound: "No events found.",

    applyingFor: "Applying for",
    personalInfo: "Personal Info",
    contactSchool: "Contact & School",
    documents: "Documents",
    noLoginNeeded:
      "✅ No account needed — any Dhaham School student can apply directly!",
    step1Label: "Step 1 — Personal Information",
    step2Label: "Step 2 — Contact & School Details",
    step3Label: "Step 3 — Upload Documents",
    fullName: "Full Name",
    fullNamePlaceholder: "As written on birth certificate",
    address: "Residential Address",
    addressPlaceholder: "House No, Street, City, District",
    dateOfBirth: "Date of Birth",
    currentGrade: "Current Grade",
    selectGrade: "— Select Grade —",
    emailAddress: "Email Address",
    emailPlaceholder: "your@email.com",
    approvalEmailNote: "Approval email sent here",
    phoneNumber: "Phone Number",
    phonePlaceholder: "07XXXXXXXX",
    smsNote: "SMS confirmation sent here",
    dhahamSchool: "Dhaham School",
    selectSchool: "— Select your Dhaham School —",
    required: "Required",
    nextContact: "Next: Contact Info →",
    nextDocuments: "Next: Documents →",
    back: "← Back",
    applicationSummary: "Application Summary",
    editDetails: "Edit details",
    passportPhoto: "Passport Photo",
    uploadPhoto: "Upload Photo",
    photoTypes: "JPG/PNG • Max 2MB",
    photoUploaded: "✓ Uploaded",
    clickToChange: "Click to change",
    birthCertificate: "Birth Certificate PDF",
    uploadPDF: "Upload PDF",
    pdfTypes: "PDF only • Max 5MB",
    approvalNote: "Approval email →",
    smsConfirmNote: "SMS confirmation →",
    submitting: "⏳ Submitting...",
    submitApplication: "📨 Submit Application",

    applicationSubmitted: "Application Submitted!",
    successDesc:
      "Your application has been received successfully. You will be notified via email and SMS.",
    registrationNumber: "Registration Number",
    saveRegNote: "Save this number — needed on event day",
    notificationsSent: "Notifications Sent:",
    statusPending: "Status: Pending Admin Review",
    statusPendingDesc:
      "You will receive a decision notification once the admin reviews your application.",
    browseMoreEvents: "Browse More Events",
    checkStatus: "Check Status",
    close: "Close",

    checkApplicationStatus: "Check Application Status",
    checkStatusDesc:
      "Enter your registration number or email to check your application status",
    searchByRegNo: "Search by Registration No",
    searchByEmail: "Search by Email",
    regNoPlaceholder: "e.g. DHS-2025-00001",
    emailSearchPlaceholder: "e.g. your@email.com",
    searching: "Searching...",
    searchBtn: "Search",
    noAppFound:
      "No application found. Check your registration number or email.",
    eligible: "You are eligible for this event!",
    notEligible: "You are not eligible for this event",
    pendingReview: "Application is pending review",
    studentName: "Student Name",
    school: "School",
    appliedOn: "Applied On",
    phone: "Phone",
    dob: "Date of Birth",
    event: "Event",
    applyAnotherEvent: "Apply for Another Event",
    goHome: "Go Home",

    adminDashboard: "Admin Dashboard",
    applications: "Applications",
    manageEvents: "Manage Events",
    manageResults: "Manage Results",
    manageSchools: "Manage Schools",
    manageUsers: "Manage Users",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    review: "Review",
    approve: "✅ Approve",
    reject: "❌ Reject",
    confirmDecision: "Confirm Decision",
    cancel: "Cancel",
    noteToStudent: "Note to Student (optional)",
    emailWillBeSent:
      "An email and SMS will be sent to the student with the decision.",
    viewPhoto: "View Photo",
    viewCertificate: "View Certificate",

    footerDesc:
      "Official event management system for Dhaham Schools across Sri Lanka.",
    quickLinks: "Quick Links",
    contact: "Contact",
    ministry: "Ministry of Education, Sri Lanka",
  },

  si: {
    home: "මුල් පිටුව",
    events: "සිදුවීම්",
    checkStatus: "තත්ත්වය පරීක්ෂා කරන්න",
    results: "ප්‍රතිඵල",
    adminLogin: "පරිපාලක පිවිසීම",
    logout: "පිටවීම",

    officialPortal: "නිල ධම්ම පාසල් සිදුවීම් ද්වාරය — ශ්‍රී ලංකාව",
    heroTitle: "ධම්ම පාසල් සිදුවීම් කළමනාකරණ පද්ධතිය",
    heroDesc:
      "සිසුන්ට කිසිදු ගිණුමක් නොමැතිව සෘජුවම සිදුවීම් සඳහා ඉල්ලුම් කළ හැකිය. පරිපාලක පාසල් කළමනාකරණය කර ඉල්ලුම්පත් අනුමත කරයි.",
    browseEvents: "සියලු සිදුවීම් බලන්න",
    checkMyStatus: "මගේ තත්ත්වය",
    viewResults: "ප්‍රතිඵල බලන්න",

    howItWorks: "ක්‍රියා කරන ආකාරය",
    step1Title: "සිදුවීම් බලන්න",
    step1Desc: "පාසල්, කලාපීය හෝ පළාත් සිදුවීම් සොයා ගන්න",
    step2Title: "දැන් ඉල්ලුම් කරන්න",
    step2Desc: "ෆෝමය විවෘත වේ — පිවිසීම අවශ්‍ය නොවේ",
    step3Title: "ලේඛන උඩුගත කරන්න",
    step3Desc: "ඡායාරූපය සහ උප්පැන්න සහතිකය",
    step4Title: "දැනුම් ලබන්න",
    step4Desc: "පරිපාලක තීරණයෙන් පසු ඊමේල් සහ SMS",

    grades: "ශ්‍රේණි",
    eventTypes: "සිදුවීම් වර්ග",
    islandWide: "දිවයින පුරා",
    allZones: "සියලු කලාප",
    levels: "මට්ටම් 3",

    announcements: "නිවේදන",
    noAnnouncements: "මේ මොහොතේ නිවේදන නොමැත.",

    upcomingEvents: "ඉදිරි සිදුවීම්",
    viewAll: "සියල්ල බලන්න",
    applyNow: "දැන් ඉල්ලුම් කරන්න",
    noEvents: "ඉදිරි සිදුවීම් නොමැත.",
    deadline: "අවසාන දිනය",
    venue: "ස්ථානය",
    eventDate: "දිනය",
    noAccountNeeded:
      '✅ ගිණුමක් අවශ්‍ය නොවේ — ඕනෑම සිදුවීමක "දැන් ඉල්ලුම් කරන්න" ක්ලික් කරන්න!',
    closedEvent: "වසා ඇත",

    eventsTitle: "සිදුවීම්",
    eventsDesc:
      "සිදුවීම් සෙවීම සහ ඉල්ලුම් කිරීම. දැන් ඉල්ලුම් කරන්න — ගිණුමක් අවශ්‍ය නොවේ!",
    search: "සෙවීම",
    searchEvents: "සිදුවීම් සෙවීම...",
    eventType: "සිදුවීම් වර්ගය",
    allTypes: "සියලු වර්ග",
    grade: "ශ්‍රේණිය",
    allGrades: "සියලු ශ්‍රේණි",
    clear: "මකන්න",
    viewDetails: "විස්තර බලන්න",
    noEventsFound: "සිදුවීම් හමු නොවීය.",

    applyingFor: "ඉල්ලුම් කිරීම",
    personalInfo: "පෞද්ගලික තොරතුරු",
    contactSchool: "සම්බන්ධතා සහ පාසල",
    documents: "ලේඛන",
    noLoginNeeded:
      "✅ ගිණුමක් අවශ්‍ය නොවේ — ඕනෑම ධම්ම පාසල් සිසුවෙකුට සෘජුවම ඉල්ලුම් කළ හැකිය!",
    step1Label: "පියවර 1 — පෞද්ගලික තොරතුරු",
    step2Label: "පියවර 2 — සම්බන්ධතා සහ පාසල් විස්තර",
    step3Label: "පියවර 3 — ලේඛන උඩුගත කිරීම",
    fullName: "සම්පූර්ණ නම",
    fullNamePlaceholder: "උප්පැන්න සහතිකයේ ඇති ආකාරයට",
    address: "ස්ථිර ලිපිනය",
    addressPlaceholder: "නිවස අංකය, වීදිය, නගරය, දිස්ත්‍රික්කය",
    dateOfBirth: "උපන් දිනය",
    currentGrade: "වත්මන් ශ්‍රේණිය",
    selectGrade: "— ශ්‍රේණිය තෝරන්න —",
    emailAddress: "විද්‍යුත් තැපෑල",
    emailPlaceholder: "your@email.com",
    approvalEmailNote: "අනුමත ඊමේල් මෙහි යවනු ලැබේ",
    phoneNumber: "දුරකථන අංකය",
    phonePlaceholder: "07XXXXXXXX",
    smsNote: "SMS තහවුරු කිරීම මෙහි යවනු ලැබේ",
    dhahamSchool: "ධම්ම පාසල",
    selectSchool: "— ඔබේ ධම්ම පාසල තෝරන්න —",
    required: "අවශ්‍යයි",
    nextContact: "ඊළඟ: සම්බන්ධතා →",
    nextDocuments: "ඊළඟ: ලේඛන →",
    back: "← ආපසු",
    applicationSummary: "ඉල්ලුම්පත් සාරාංශය",
    editDetails: "විස්තර සංස්කරණය කරන්න",
    passportPhoto: "විදේශ ගමන් බලපත්‍ර ඡායාරූපය",
    uploadPhoto: "ඡායාරූපය උඩුගත කරන්න",
    photoTypes: "JPG/PNG • උපරිම 2MB",
    photoUploaded: "✓ උඩුගත කරන ලදී",
    clickToChange: "වෙනස් කිරීමට ක්ලික් කරන්න",
    birthCertificate: "උප්පැන්න සහතිකය (PDF)",
    uploadPDF: "PDF උඩුගත කරන්න",
    pdfTypes: "PDF පමණක් • උපරිම 5MB",
    approvalNote: "අනුමත ඊමේල් →",
    smsConfirmNote: "SMS තහවුරු කිරීම →",
    submitting: "⏳ ඉදිරිපත් කරමින්...",
    submitApplication: "📨 ඉල්ලුම්පත ඉදිරිපත් කරන්න",

    applicationSubmitted: "ඉල්ලුම්පත ඉදිරිපත් කරන ලදී!",
    successDesc:
      "ඔබේ ඉල්ලුම්පත සාර්ථකව ලැබී ඇත. ඊමේල් සහ SMS මගින් ඔබව දැනුවත් කරනු ලැබේ.",
    registrationNumber: "ලියාපදිංචි අංකය",
    saveRegNote: "මෙම අංකය සුරකින්න — සිදුවීම් දිනයේ අවශ්‍ය වේ",
    notificationsSent: "දැනුම් දීම් යවා ඇත:",
    statusPending: "තත්ත්වය: පරිපාලක සමාලෝචනය බලාපොරොත්තුවෙන්",
    statusPendingDesc:
      "පරිපාලක ඔබේ ඉල්ලුම්පත සමාලෝචනය කළ පසු ඔබට දැනුම් දීමක් ලැබෙනු ඇත.",
    browseMoreEvents: "තවත් සිදුවීම් බලන්න",
    checkStatus: "තත්ත්වය පරීක්ෂා කරන්න",
    close: "වසන්න",

    checkApplicationStatus: "ඉල්ලුම්පත් තත්ත්වය පරීක්ෂා කරන්න",
    checkStatusDesc:
      "ඔබේ ලියාපදිංචි අංකය හෝ ඊමේල් ඇතුළු කර ඔබේ ඉල්ලුම්පත් තත්ත්වය පරීක්ෂා කරන්න",
    searchByRegNo: "ලියාපදිංචි අංකයෙන් සෙවීම",
    searchByEmail: "ඊමේල් මගින් සෙවීම",
    regNoPlaceholder: "උදා: DHS-2025-00001",
    emailSearchPlaceholder: "උදා: your@email.com",
    searching: "සොයමින්...",
    searchBtn: "සෙවීම",
    noAppFound:
      "ඉල්ලුම්පතක් හමු නොවීය. ඔබේ ලියාපදිංචි අංකය හෝ ඊමේල් පරීක්ෂා කරන්න.",
    eligible: "ඔබ මෙම සිදුවීම සඳහා සුදුස්සෙකි!",
    notEligible: "ඔබ මෙම සිදුවීම සඳහා සුදුසු නොවේ",
    pendingReview: "ඉල්ලුම්පත සමාලෝචනය බලාපොරොත්තුවෙන් ඇත",
    studentName: "සිසුවාගේ නම",
    school: "පාසල",
    appliedOn: "ඉල්ලුම් කළ දිනය",
    phone: "දුරකථනය",
    dob: "උපන් දිනය",
    event: "සිදුවීම",
    applyAnotherEvent: "තවත් සිදුවීමකට ඉල්ලුම් කරන්න",
    goHome: "මුල් පිටුවට",

    adminDashboard: "පරිපාලක උපකරණ පුවරුව",
    applications: "ඉල්ලුම්පත්",
    manageEvents: "සිදුවීම් කළමනාකරණය",
    manageResults: "ප්‍රතිඵල කළමනාකරණය",
    manageSchools: "පාසල් කළමනාකරණය",
    manageUsers: "පරිශීලකයින් කළමනාකරණය",
    pending: "රැඳී ඇත",
    approved: "අනුමත",
    rejected: "ප්‍රතික්ෂේප",
    review: "සමාලෝචනය",
    approve: "✅ අනුමත කරන්න",
    reject: "❌ ප්‍රතික්ෂේප කරන්න",
    confirmDecision: "තීරණය තහවුරු කරන්න",
    cancel: "අවලංගු කරන්න",
    noteToStudent: "සිසුවාට සටහන (අත්‍යවශ්‍ය නොවේ)",
    emailWillBeSent: "සිසුවාට ඊමේල් සහ SMS තීරණය සමඟ යවනු ලැබේ.",
    viewPhoto: "ඡායාරූපය බලන්න",
    viewCertificate: "සහතිකය බලන්න",

    footerDesc:
      "ශ්‍රී ලංකාව පුරා ධම්ම පාසල් සඳහා නිල සිදුවීම් කළමනාකරණ පද්ධතිය.",
    quickLinks: "ඉක්මන් සබැඳි",
    contact: "සම්බන්ධ වන්න",
    ministry: "අධ්‍යාපන අමාත්‍යාංශය, ශ්‍රී ලංකාව",
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("dhaham_lang") || "en",
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("dhaham_lang", lang);
  };

  const t = (key) =>
    translations[language]?.[key] || translations["en"]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export default translations;
