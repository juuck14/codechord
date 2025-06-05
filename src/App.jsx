import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "@/components/Header";
import Search from "@/components/Search";
import Test from "@/components/Test";
import Compare from "@/components/Compare";
import SearchedItem from "@/components/SearchedItem"
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

function App() {
    const [items, setItems] = useState([]);
    const [addedItem, setAddedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSongClick = (d) => {
        let newSelectedItems = [];
        if (selectedItems.some((item) => item.id === d.id && item.section === d.section)) {
            newSelectedItems = selectedItems.filter(
                (item) => !(item.id === d.id && item.section === d.section)
            );
        } else {
            newSelectedItems = [...selectedItems, d];
            if (newSelectedItems.length > 2) {
                toast.error("최대 2개의 아이템만 선택할 수 있습니다.");
                return;
            }
        }
        // console.log(newSelectedItems);

        setSelectedItems(newSelectedItems);
    };

    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    return (
        <>
            <Header />
            <div className="flex w-full h-screen bg-gray-100">
                <div className="w-7/12">
                    <Test
                        items={items}
                        addedItem={addedItem}
                        setAddedItem={setAddedItem}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        handleSongClick={handleSongClick}
                    />
                    <Compare
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                </div>

                <div style={{ width: 400 }}>
                    <Search
                        items={items}
                        setItems={setItems}
                        setAddedItem={setAddedItem}
                    />
                    <div>
                        {items.map((item, index) => (
                            <SearchedItem
                                key={item.id}
                                index={index}
                                item={item}
                                selectedItems={selectedItems}
                                handleSongClick={handleSongClick}
                                deleteItem={deleteItem}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer position="top-left" />
        </>
    );
}

export default App;
