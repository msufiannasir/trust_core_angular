import { NbMenuItem } from '@nebular/theme';
import { CollectionsService } from '../services/collections.service';
import { AuthGuard} from '../../app/auth.guard';

const roleBasedMenus=[];
var userrole=0;
const user = localStorage.getItem('user');
var parsedUser ;
if(typeof user !='undefined' || user!='' || user!=null){
  parsedUser=JSON.parse(user);
}
function accessControl(){
  var accessControllist={
    3: {view: ['offers, reports, settings, dashboard'], edit:[]},
    2: {view: ['customers, offers, templates, dashboard,insurance-companies,settings'], edit:['offers, templates, reports, settings,insurance-companies']},
    1: {view: [' offers, templates, reports, settings, collections, dashboard,insurance-companies, users,'], edit:['users, offers, templates, reports, settings, collections,insurance-companies, users']},
    0: {view: [], edit:[]}
  };
  return accessControllist;
}
var accessControllist=accessControl();
if (parsedUser && parsedUser.roles) {
   userrole=parsedUser.roles[0].id;
}
var usermenus: NbMenuItem[]=[{
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  }, 
];
// console.log(accessControllist[userrole].view[0], 'accessControllist[userrole].view[0]', accessControllist[userrole].view[0].includes('offers'));
if(userrole!=0){
if(accessControllist[userrole].view[0].includes('offers')){
  usermenus.push( {
    title: 'Offers',
    // icon: 'home-outline',
    link: '/pages/offers',
    home: true,
    children: [
      {
        title: 'Create Offer',
        link: '/pages/offers/create',
      },
      {
        title: 'List Offers',
        link: '/pages/offers',
      }
]
  });
}
if(accessControllist[userrole].view[0].includes('templates')){
  usermenus.push( 
    {
      title: 'Templates',
      // icon: 'home-outline',
      link: '/pages/collections/templates/all',
      home: true,
      children: [
            {
              title: 'Create Template',
              link: '/pages/templates/create',
            },
            {
              title: 'List Templates',
              link: '/pages/collections/templates/all',
            }
      ]
    },

  );
}
if(accessControllist[userrole].view[0].includes('insurance-companie')){
  usermenus.push( 
    {
      title: 'Company Credentials',
      // icon: 'home-outline',
      link: '/pages/insurance-companies',
      home: true,
    },

  );
}
// if(accessControllist[userrole].view[0].includes('reports')){
//   usermenus.push( 
//     {
//       title: 'Reports',
//       // icon: 'home-outline',
//       link: '/pages/reports',
//       home: true,
//     },

//   );
// }
if(accessControllist[userrole].view[0].includes('customers')){
  usermenus.push( 
    {
      title: 'Customers',
      // icon: 'home-outline',
      link: '/pages/users/list',
      home: true,
    },

  );
}
if(accessControllist[userrole].view[0].includes('users')){
  usermenus.push( 
    {
      title: 'Users',
      // icon: 'home-outline',
      link: '/pages/users/list/all',
      home: true,
    },

  );
}
if(accessControllist[userrole].view[0].includes('settings')){
  usermenus.push( 
    {
      title: 'Dashboard Settings',
      // icon: 'home-outline',
      link: '/pages/settings/user',
      // home: true,
      // children: [
      //       // {
      //       //   title: 'Dashboard Setting',
      //       //   link: '/pages/settings/site',
      //       // },
      //       {
      //         title: 'Dashboard Setting',
      //         link: '/pages/settings/user',
      //       }
      // ]
    },

  );
}
if(accessControllist[userrole].view[0].includes('collections')){
  usermenus.push( 
    {
      title: 'Collections',
      // icon: 'home-outline',
      link: '/pages/collections/all',
      home: true,
    },

  );
}
}
export const MENU_ITEMS: NbMenuItem[] = usermenus;
