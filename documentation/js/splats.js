(function(){
  var award_medals, contenders, gold, silver, the_field;
  gold = (silver = (the_field = "unknown"));
  award_medals = function award_medals(first, second) {
    var rest;
    rest = Array.prototype.slice.call(arguments, 2, arguments.length - 0);
    gold = first;
    silver = second;
    the_field = rest;
    return the_field;
  };
  contenders = ["Michael Phelps", "Liu Xiang", "Yao Ming", "Allyson Felix", "Shawn Johnson", "Roman Sebrle", "Guo Jingjing", "Tyson Gay", "Asafa Powell", "Usain Bolt"];
  award_medals.apply(this, contenders);
  alert("Gold: " + gold);
  alert("Silver: " + silver);
  alert("The Field: " + the_field);
})();
