const PORT = 3000;

mongoose.connect(DB_PATH)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch(err => {
        console.log("Error while connecting to MongoDB:", err);
    });