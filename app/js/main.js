// var eleNavTopic = document.querySelectorAll('.mobile-title-topic');
// function openNavMobilelv3(){
//     eleNavTopic.forEach.call(eleNavTopic, (eachTopic) =>{
//         eachTopic.addEventListener('click', () =>{
//             toggleElm(eachTopic.parentElement.querySelectorAll('.mobile-list-nav-lv3')[0], 'open-nav-lv3');
//             toggleElm(eachTopic.querySelector('.icon-title'), 'close-child');
//             toggleElm(eachTopic, 'open-child');
//         });
//     });
// };
// openNavMobilelv3();


var headerGlobalLink = document.querySelectorAll('.header-link-global-content');


// $('.page-view-all-thumb').slick({
//     responsive: [
//     {
//       breakpoint: 1005,
//       settings: 'unslick';
//     },
//     {
//       breakpoint: 1000,
//       settings: {
//         slidesToShow: 1,
//         slidesToScroll: 1,
//         infinite: false,
//         dots: false,
//         arrows: false,
//         centerMode: true,
//       }
//     },
//   ]
// });

// var headerWrapper = document.querySelector('.header-box-wrapper');
// console.log(headerGlobalLink);


// function handleHoverNavShowMore() {
//     var navMoreItem = document.querySelectorAll('.show-more-single-item');

//     if (navMoreItem.length > 0) {
//       navMoreItem.forEach(function (el, index) {
//         el.onmouseenter = function (event) {
//           // add/remove class active
//           var sibEl = event.target.parentElement.children;
//           for (var i = 0; i < sibEl.length; i++) {
//             sibEl[i].classList.remove('is-active');
//           }
//           event.target.classList.add('is-active');

//           // show/hide content match parent
//           var attDataParent = event.target.getAttribute('data-nav-parent-id');
//           var navContent = document.querySelectorAll('.show-more-nav-content');
//           navContent.forEach(function (el, index) {
//             el.classList.remove('is-active');
//             if (el.getAttribute('data-nav-child-id') === attDataPrent) {
//               el.classList.add('is-active')
//             }
//           });

//           // handle height show more nav box
//           var hBoxNav = el.closest('.show-more-nav-box').querySelector('.show-more-nav-box-container').getBoundingClientRect().height;
//           el.closest('.show-more-nav-box').style.height = hBoxNav + 'px';
//           // console.log(hBoxNav);
//         }
//       });
//     }
//   }
