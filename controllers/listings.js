const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Token = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken : Token})
// const mapToken = process.env.MAP_TOKEN;
// var NodeGeocoder = require('node-geocoder');
// var options = {
//     provider: 'tomtom',
  
//     // Optionnal depending of the providers
//     httpAdapter: 'https', // Default
//     apiKey: mapToken, // for Mapquest, OpenCage, Google Premier
//     formatter: null         // 'gpx', 'string', ...
//   };

//   const geocoder = NodeGeocoder(options);
  

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exists!");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
 let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
 })
   .send()
console.log(response.body.features[0].geometry);
// res.send("done!");
// const response = await geocoder.geocode(req.body.listing.location);
   
    let url = req.file.path;
    let filename = req.file.filename;
    let newlisting = new Listing(req.body.listing);
    console.log(req.user);
    newlisting.owner = req.user._id;
    newlisting.image = {url , filename};

    newlisting.geometry = response.body.features[0].geometry;
    console.log("from my side ",newlisting);
    await newlisting.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exists!");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/h_300,w_250");
    res.render("./listings/edit.ejs", { listing , originalImageUrl });
};

module.exports.updateListing =  async (req, res) => {
    
    // const response = await geocoder.geocode(req.body.listing.location);
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }

    
    // listing.geometry = response[0];

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


module.exports.filter = async(req,res,next)=>{
    let {id} = req.params;
    let allListings = await Listing.find({category: id});
    if(allListings.length != 0){
        res.render("listings/index.ejs", { allListings });
    }else{
        req.flash("error",`No listing with ${id}`);
        res.redirect("/listings")
    }
}

module.exports.search = async (req, res) => {
    // let { location } = req.query;
    console.log("Searching...");
    const { place } =  req.query
    console.log(req.query);
    const allListings = await Listing.find({country:place });
    console.log(allListings);
    res.render("./listings/index.ejs", { allListings });
};
