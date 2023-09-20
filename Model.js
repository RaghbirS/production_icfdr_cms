const mongoose = require("mongoose");
require("dotenv").config();
// const connection = mongoose.connect(
//   "mongodb+srv://gofra:gofra@cluster0.a9uxn51.mongodb.net/ContactManagementSystem"
// );
const connection = mongoose.connect(
  process.env.CONNECTION_STRING
);

const usersSchema = mongoose.Schema({
  googleLogin: { type: Boolean },
  googleRefreshToken: { type: String },
  role: { type: String, default:"Leader" },
  isAdmin: { type: Boolean },
  permissions: {
    type: Object,
    default: {
      "Admin": {
        "create": true,
        "update": false,
        "delete": false
      },
      "Leader": {
        "create": true,
        "update": false,
        "delete": false
      },
      "Center": {
        "create": true,
        "update": false,
        "delete": false
      },
      "Configuration": {
        "create": true,
        "update": false,
        "delete": false
      },
      "YWC Varanasi": {
        "create": true,
        "update": false,
        "delete": false
      },
      "Umeed Bhawan": {
        "create": true,
        "update": false,
        "delete": false
      },
      "ISKCON Varanasi": {
        "create": true,
        "update": false,
        "delete": false
      },
      "ISKCON Prayagraj": {
        "create": true,
        "update": false,
        "delete": false
      }
    }
  },
  name: { type: String },
  assignedCenter: { type: String, default:"YWC Varanasi" },
  centers: { type: Object },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  whatsApp: { type: String },
  password_changed: { type: Boolean },
  details: { type: Object },
  ownerID: { type: String },
  isDataHidden: { type: Boolean },
  creator: { type: Object, default:{
    "name": "Test Account",
    "_id": "64e8be4d1b836b49647d78aa"
  } },
});
const meetingsSchema = mongoose.Schema({
  leadSource: { type: String },
  email: { type: String },
  company: { type: String },
  website: { type: String },
  contactName: { type: String },
  phone: { type: String },
  priority: { type: String },
  subject: { type: String },
  date: { type: String },
  time: { type: String },
  status: { type: String },
  userID: { type: String },
});

const contactsSchema = mongoose.Schema({
  name: { type: String },
  leadSource: { type: String },
  phone: { type: String },
  email: { type: String },
  company: { type: String },
  moreContacts: { type: Array },
  website: { type: String },
  dob: { type: String },
  department: { type: String },
  userID: { type: String },
});
const notesSchema = mongoose.Schema({
  topic: { type: String },
  content: { type: String },
  userID: { type: String },
  favorite: { type: Boolean },
  date: { type: String },
  time: { type: String },
});
const accountSchema = mongoose.Schema({
  accountOwner: { type: String, required: true },
  accountName: { type: String, required: true },
  accountSite: { type: String },
  parentAccount: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountType: { type: String },
  industry: { type: String },
  annualRevenue: { type: String },
  phone: { type: String, required: true },
  fax: { type: String },
  website: { type: String },
  employees: { type: String, required: true },
  sicCode: { type: String, required: true },
  address: { type: Object, required: true },
  userID: { type: String, required: true },
});

const emailTrackerSchema = mongoose.Schema({
  email: { type: String, required: true },
  userID: { type: String, required: true },
  content: { type: Object, required: true },
  from: { type: Object, required: true },
  date: { type: String },
  time: { type: String },
  center: { type: Array },
});
const whatsappTrackerSchema = mongoose.Schema({
  mobile: { type: String, required: true },
  userID: { type: String, required: true },
  content: { type: Object, required: true },
  from: { type: Object, required: true },
  date: { type: String },
  time: { type: String },
  center: { type: Array },
});

const customersInfoSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String },
  userID: { type: String },
  contact: { type: String },
});
const membersSchema = mongoose.Schema({
  phone: { type: String },
  email: { type: String },
  password: { type: String },
  dob: { type: String },
  center: { type: String },
  details: { type: Object },
  createdBy: { type: String, default:"Test Account" },
  userID: { type: String, default:"64e8be4d1b836b49647d78aa" },
  hidden: { type: Boolean },
});
const configurationSchema = mongoose.Schema({
  userID: { type: String },
  centers: { type: Array },
  roles: { type: Array },
  professionCategories: { type: Object },
  categoryFormPermission: { type: Object },
  roleFormPermission: { type: Object },
  donorTypeForm: { type: Object },
});

const chatsSchema = mongoose.Schema({
  from: { type: Object, required: true },
  to: { type: Object, required: true },
  body: { type: Object },
  date: { type: String },
  time: { type: String },
});

const logsSchema = mongoose.Schema({
  from: { type: Object, required: true },
  activity: { type: String, required: true },
  date: { type: String },
  time: { type: String },
});

const formSchema = mongoose.Schema({
  _id: { type: String },
  memberID: { type: String },
  isFormSubmitted: { type: Boolean },
  filledData: { type: Object },
  configurationSettings: { type: Object },
});
const announcementsSchema = mongoose.Schema({
  title: { type: String },
  content: { type: String },
  userID: { type: String },
  date: { type: String },
  time: { type: String },
});
const allDonations = mongoose.Schema({
  date: { type: String },
  name: { type: String },
  address: { type: String },
  paymentMode: { type: String },
  transactionNumber: { type: String },
  donation: { type: Number },
  tempReceiptNumber: { type: Number },
  permReceiptNumber: { type: Number },
  donorType: { type: String },
  center: { type: String },
  year: { type: String },
  month: { type: String },
  memberID: { type: String },
  userID: { type: String },
  bankName: {type:String}
});
const monthlyData = mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Object, required: true },
});

const UsersModel = mongoose.model("user", usersSchema);
const MeetingsModel = mongoose.model("meeting", meetingsSchema);
const NotesModel = mongoose.model("note", notesSchema);
const ContactsModel = mongoose.model("contact", contactsSchema);
const AccountModel = mongoose.model("account", accountSchema);
const EmailTrackerModel = mongoose.model("emailTracker", emailTrackerSchema);
const whatsAppTrackerModel = mongoose.model(
  "whatsAppTracker",
  whatsappTrackerSchema
);
const CustomersInfoModel = mongoose.model("customersInfo", customersInfoSchema);
const ChatModel = mongoose.model("chat", chatsSchema);
const MemberModel = mongoose.model("member", membersSchema);
const ConfigurationModel = mongoose.model("configuration", configurationSchema);
const LogsModel = mongoose.model("logs", logsSchema);
const WhatsappTrackerModel = mongoose.model(
  "whatsappTracker",
  whatsappTrackerSchema
);
const FormModel = mongoose.model("form", formSchema);
const AnnouncementModel = mongoose.model("announcement", announcementsSchema);
const AllDonationsModel = mongoose.model("allDonation", allDonations);
const MonthlyDataModel = mongoose.model("monthlyData", monthlyData);

module.exports = {
  connection,
  UsersModel,
  MeetingsModel,
  NotesModel,
  ContactsModel,
  AccountModel,
  EmailTrackerModel,
  whatsAppTrackerModel,
  CustomersInfoModel,
  ChatModel,
  MemberModel,
  ConfigurationModel,
  LogsModel,
  WhatsappTrackerModel,
  FormModel,
  AnnouncementModel,
  AllDonationsModel,
  MonthlyDataModel,
};
