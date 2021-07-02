class CategoryDrag {

    constructor() {
        this.dragId = "";
        this.dragParentId = "";
    }

    startDrag(id, parentId) {
        this.dragId = id;
        this.dragParentId = parentId;
    }
}