var admobid = {};

if( /(android)/i.test(navigator.userAgent) ) {
  admobid = { // for Android
    banner: 'ca-app-pub-4400088783500800/8156202576',
    interstitial: 'ca-app-pub-4400088783500800/2109668973'
  };
} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
  admobid = { // for iOS
    banner: 'ca-app-pub-4400088783500800/8156202576',
    interstitial: 'ca-app-pub-4400088783500800/2109668973'
  };
} else {
  admobid = { // for Windows Phone
    banner: 'ca-app-pub-4400088783500800/8156202576',
    interstitial: 'ca-app-pub-4400088783500800/2109668973'
  };
}

function initApp() {
  if (! AdMob ) {
      alert( 'admob plugin not ready' );
      return;
  }

  // this will create a banner on startup
  AdMob.createBanner({
    adId: admobid.banner,
    position: AdMob.AD_POSITION.BOTTOM_CENTER,
    overlap: false,
    offsetTopBar: false,
    bgColor: 'black',
    isTesting: true
  });

  // this will load a full screen ad on startup
  AdMob.prepareInterstitial({
    adId: admobid.interstitial,
    autoShow: true,
    isTesting: true
  });
}

if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
    document.addEventListener('deviceready', initApp, false);
} else {
    initApp();
}
