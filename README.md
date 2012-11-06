This is the code for GoDC.me, winner of the [2012 DCWeek hackathon](http://digitalcapitalweek.org/dcweek-hackathon-announces-winners/). GoDC.me is an integrated local transit information web application -- showing Metro, Metrobus, and Capital Bikeshare all in one UI -- and is designed and developed from the ground up to work better than the native apps everyone has a dozen of on their iOS and Android devices; all methods will be publicly exposed for the local transit development community. Server-side code in node.js, client-side code using jQuery and handlebars for templating.

The application is currently living at http://transithack.herokuapp.com while we rework some of the core components to make it more useful for everyone. Once we're satisfied with it, we'll redirect the domain name to there rather than this repo.

Moving forward, the development schedule looks like this:
* Make the display of bus and bikeshare data suck a little less on mobile
* Reorganize the server-side code (models and controllers)
* Clean up the UI a little bit and migrate the mobile view to Ratchet
* Migrate most of the bus schedules to published timetables (cuts down on API calls and gives faster response times)
* Create the responsive desktop view
* Integrate other bus providers (Circulator, ART, RideOn, etc...)
* Integrate Car2Go
* Integrate Uber
* Integrate Zipcar

We like suggestions. And pull requests.

Much love,

Kyle Hill ([@kylehill](http://twitter.com/kylehill)) and Laura McGuigan ([@grafxnerd](http://twitter.com/grafxnerd]))