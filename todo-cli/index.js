const {connect}=require("./connectDB.js"); 
const Todo = require("./TodoModel.js");

const createTodo=async()=>{
    try{
        await connect();
        const todo=await Todo.addTask({
            title:"Second Item",
            dueDate:new Date(),
            completed:false,
        });
        console.log(`Created todo with ID:${todo.id}`);
    }catch(err){
        console.log(err);
    }
};

const countItems=async()=>{
    try{
        const totalCount=await Todo.count();
        console.log(`Found ${totalCount} item in the table`);
    }catch(err){
        console.error(err);
    }
}

const getAllTodos=async()=>{
    try{
        const todos=await Todo.findAll();
        const todoList=todos.map(todo=>todo.desplayableString()).join("\n");
        console.log(todoList);
    }catch(err){
        console.error(err);
    }
}


const getSingleTodo=async()=>{
    try{
        const todo=await Todo.findOne({
            where:{
                completed:false
            },
            order:[
                ['id','DESC']
            ]
        });
        // const todoList=todos.map(todo=>todo.desplayableString()).join("\n");
        console.log(todo.desplayableString());
    }catch(err){
        console.error(err);
    }
}


const updateItem=async (id)=>{
    try{
        await Todo.update({completed: true},{
            where:{
                id:id,
            }
        });
    }
    catch(err){
        console.error(err);
    }
}

const deleteItem=async (id)=>{
    try{
        const deleteRowCount=await Todo.destroy({
            where:{
                id:id,
            }
        });
        console.log(`Deleted ${deleteRowCount} rows!`);
    }catch(err){
        console.error(err);
    }
}


// ====================================
(async()=>{
    await getAllTodos();
    await countItems();
})();


//============ IIFE =======================
// (async ()=>{
//     await createTodo();
//     // await countItems();
//     await getAllTodos();
//     // await updateItem(2);
//     // await deleteItem(2);
//     await countItems();
//     await getAllTodos();
// })();