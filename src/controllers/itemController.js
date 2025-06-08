//so we should CRUD items ADMIN MANAGER
//DB (id , name  , description , category , expiry_date ,stock_quantity)

const item = require("../utils/itemModelHelper");

const addItems = async ( req , res ) => {
    try {
        let items = req.body;
        //to support single obj 
        if (!Array.isArray(items)) {
            items = [items];
        }

        const createdItems = [];
        for (const itemData of items) {
            const newItem = await item.create({
                name: itemData.name,
                description: itemData.description,
                price: itemData.price,
                category: itemData.category,
                //front end will send a date 
                expiry_date: itemData.expiryDate,
                stock_quantity: itemData.stockQuantity
            });
            createdItems.push(newItem);
        };
        
      res.status(200).json({
            message: createdItems.length > 1 ? "Items created successfully." : "Item created successfully.",
            items: createdItems
        });
    } catch (err) {
        res.status(500).json({ message: "An error ocurred while creating item" , err: err.message });
    }
};

const getItem = async ( req , res ) => {
    try {
        const id = req.params.id;
        const itemData = await item.getItemById(id);
        const role = req.user?.role || req.session?.role;
        if( itemData === null){
            return res.status(404).json({message:"No item available!"})
        }

        if( role === "cashier" && (itemData.expiry_date < new Date())){
            return res.status(404).json({message:"No item available!"})
        }

        res.status(200).json({message:"Item found." , item: itemData});
    } catch (err) {
        res.status(500).json({ message: "Server error while getting an item." , err: err.message });
    }
};

const getAllItems = async ( req , res ) => {
    try { 
        //in the requirement u are saying that waiter should only see non expired i think its a typo 
        // if it is not i can just change that to waiter
        let items ;
        const role = req.user?.role || req.session?.role;
        if(["manager", "admin"].includes(role) ){
            items = await item.getAll("all");
        }else if (role === "cashier"){
            items = await item.getAll( "nonExpired" );
        }
        res.status(200).json({items});
    } catch (err) {
        res.status(500).json({ message: "Server error while getting items.", err: err.message });
    }
};  

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const itemExisted = await item.getItemById(id);
        if( !itemExisted ) {
            return res.status(404).json({ message: "Item not found" });
        }; 

        const updated = await item.update(id, updateData);
        if (!updated) {
            return res.status(404).json({ message: "An error ocurred while updating item" });
        }
        res.status(200).json({ message: "Item updated successfully.", item: updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating item.", err: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await item.delete( id );
        if (!deleted) {
            return res.status(404).json({ message: "Item not found or already deleted." });
        }
        res.status(200).json({ message: "Item deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item.", err: err.message });
    }
};

const getFilteredAndSortedItems = async (req, res) => {
  try {
    const { category , sortBy , order } = req.query;
    const role = req.user?.role || req.session?.role;
    const items = await item.getFilteredAndSorted({ category , sortBy , role , order });
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", err: err.message });
  }
};

module.exports = { addItems, getItem , getAllItems, updateItem, deleteItem , getFilteredAndSortedItems };

