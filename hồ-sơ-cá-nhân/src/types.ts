export interface User {
  registrationNumber: string;
  userName: string;
}

export interface AttachedFile {
  name: string;
  url: string;
}

export interface AcademyItem {
  id: string;
  nameOfUnit: string;
  nameOfMajor: string;
  addInformations: string;
  fileName?: string;
  fileUrl?: string;
  files?: AttachedFile[];
}

export interface ExperienceItem {
  id: string;
  companyName: string;
  position: string;
  particularTasks: string;
  extraInformations: string;
  fileName?: string;
  fileUrl?: string;
  files?: AttachedFile[];
}

export interface ActivityItem {
  id: string;
  clubName: string;
  position: string;
  particularTasks: string;
  extraInformations: string;
  fileName?: string;
  fileUrl?: string;
  files?: AttachedFile[];
}

export interface ContactInfo {
  phoneNumber: string;
  emailAddress: string;
  linkedinLink: string;
  facebookLink: string;
}

export interface AboutMeInfo {
  paragraph: string;
  imageUrl: string;
}

export interface UserProfile {
  registrationNumber: string;
  userName: string;
  aboutMe: AboutMeInfo;
  academy: AcademyItem[];
  experiences: ExperienceItem[];
  activities: ActivityItem[];
  contact: ContactInfo;
}
