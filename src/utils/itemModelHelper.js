const { Op } = require("sequelize");
const db = require("../models/index");
const {Item} = db;

const item = {
    async create ( data ) {
        const itemData = await Item.create(data);
        return itemData.toJSON();
    },
    async getItemById ( id ) {
        const itemData = await Item.findByPk( id );
        if( !itemData ) return null;
        return itemData.toJSON();
    },
    async getAll ( stat ) {
        let items
        if( stat === "all" ){
            items = await Item.findAll();
            return items.map(item => item.toJSON());
        }

        if (stat === "nonExpired") {
            items = await Item.findAll({
            where: { expiry_date: { [Op.gte]: new Date() } }
        });
        }
        if (!items) return [];
        return items.map(item => item.toJSON());
    },
    async update ( id , data ) {
        //[affectedRows , returning: true || false]
        const [affectedRows] = await Item.update(data, {
                where: { id }
            });
        if (affectedRows === 0) return null;
            
        const updatedItem = await Item.findByPk(id);
        return updatedItem ? updatedItem.toJSON() : null;
    },
    async delete (id) {
        const itemData = await Item.findByPk( id );
        if (!itemData) return null;
        return await Item.destroy({ where: { id } });
    },
    async getFilteredAndSorted({ category, sortBy , role , order }) {

    const where = {};
    if (category && ["food", "beverages", "others"].includes(category)) {
      where.category = category;
    }
    //cashier can not see expired items so we add this to the filter if he is cashire 
    if (role === "cashier") {
        where.expiry_date = { [Op.gte]: new Date() };
    }
    let orderArr = [];
    if (sortBy) {
      if (["name", "price", "expiry_date"].includes(sortBy)) {
        orderArr = [[sortBy, order === "desc" ? "DESC" : "ASC"]];
      } else if (sortBy === "total_stock_value") {
        orderArr = [
          [
            db.Sequelize.literal("price * stock_quantity"),
            order === "desc" ? "DESC" : "ASC"
          ]
        ];
      }
    }

    const items = await Item.findAll({
      where,
      order: orderArr
    });

    return items.map(item => item.toJSON());
  }
};

module.exports = item;