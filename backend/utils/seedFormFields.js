const FormField = require('../models/FormField');

const defaultFields = [
  {
    formType: 'school_registration',
    fieldName: 'principalPhone',
    fieldLabel: "Principal's Phone Number",
    fieldLabelSinhala: 'විදුහල්පතිගේ දුරකථන අංකය',
    fieldType: 'tel',
    isRequired: false,
    isActive: true,
    section: 'Contact Details',
    sectionSinhala: 'සම්බන්ධතා විස්තර',
    displayOrder: 10,
    showOnStep: 1,
  },
  {
    formType: 'school_registration',
    fieldName: 'numberOfStudents',
    fieldLabel: 'Number of Students',
    fieldLabelSinhala: 'සිසුන් සංඛ්‍යාව',
    fieldType: 'number',
    isRequired: false,
    isActive: true,
    section: 'School Details',
    sectionSinhala: 'පාසල් විස්තර',
    displayOrder: 11,
    showOnStep: 1,
    validationRules: { min: 1, max: 10000 },
  },

  {
    formType: 'event_application',
    fieldName: 'parentFullName',
    fieldLabel: 'Parent / Guardian Full Name',
    fieldLabelSinhala: 'දෙමාපිය / භාරකාර සම්පූර්ණ නම',
    fieldType: 'text',
    isRequired: false,
    isActive: true,
    section: 'Parent Information',
    sectionSinhala: 'දෙමාපිය තොරතුරු',
    displayOrder: 10,
    showOnStep: 2,
  },
  {
    formType: 'event_application',
    fieldName: 'parentPhone',
    fieldLabel: 'Parent / Guardian Phone',
    fieldLabelSinhala: 'දෙමාපිය / භාරකාර දුරකථන',
    fieldType: 'tel',
    isRequired: false,
    isActive: true,
    section: 'Parent Information',
    sectionSinhala: 'දෙමාපිය තොරතුරු',
    displayOrder: 11,
    showOnStep: 2,
  },
  {
    formType: 'event_application',
    fieldName: 'studentNIC',
    fieldLabel: 'Student NIC / Birth Certificate Number',
    fieldLabelSinhala: 'ජාතික හැඳුනුම්පත් / උප්පැන්න සහතික අංකය',
    fieldType: 'text',
    isRequired: false,
    isActive: true,
    section: 'Identity',
    sectionSinhala: 'හැඳුනුම් විස්තර',
    displayOrder: 12,
    showOnStep: 1,
  },
  {
    formType: 'event_application',
    fieldName: 'mediumOfInstruction',
    fieldLabel: 'Medium of Instruction',
    fieldLabelSinhala: 'ඉගෙනුම් මාධ්‍යය',
    fieldType: 'radio',
    isRequired: false,
    isActive: true,
    fieldOptions: [
      { value: 'sinhala', label: 'Sinhala', labelSi: 'සිංහල' },
      { value: 'english', label: 'English', labelSi: 'ඉංග්‍රීසි' },
      { value: 'tamil', label: 'Tamil', labelSi: 'දෙමළ' },
    ],
    section: 'Academic Details',
    sectionSinhala: 'අධ්‍යාපන විස්තර',
    displayOrder: 13,
    showOnStep: 1,
  },
];

const seedFormFields = async () => {
  const count = await FormField.count();
  if (count > 0) {
    console.log('ℹ️  Form fields already seeded — skipping');
    return;
  }

  for (const field of defaultFields) {
    await FormField.create(field);
    console.log(`✅ Form field created: ${field.fieldLabel}`);
  }
  console.log('🎉 Default form fields seeded!');
};

module.exports = seedFormFields;
