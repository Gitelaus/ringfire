class Card{
    constructor(house, value, revealed){
        this.house = house;
        this.value = value;
        this.revealed = revealed;
    }

    getCardImageURL(){
        return "";
    }
}

module.exports = Card;