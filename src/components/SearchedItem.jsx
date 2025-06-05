import React, { useState } from "react";
import { COLOR_SCHEME } from "@/common";

export default function SearchedItem({ index, item, deleteItem, handleSongClick }) {
    const [selected, setSelected] = useState(false);
    console.log(item);
    

    const handleClick = () => {
        if (selected) {
            setSelected(false);
        } else {
            setSelected(true);
        }
    }

    return (
        <div onClick={() => handleClick()}>
            <div style={{
                width: 20,
                height: 20,
                backgroundColor: COLOR_SCHEME[index],
                display: 'inline-block',
                marginRight: 10
            }}>
            </div>
            {item.artist} - {item.song}
            <span className="border text-xs ml-2" onClick={() => deleteItem(item.id)}>delete</span>
            <br/>
            {
                selected ? item.chordsInfos.map((chordsInfo, i) => (
                    <span
                        key={i}
                        className="ml-2 cursor-pointer"
                        onClick={() => handleSongClick({
                            ...chordsInfo,
                            id: item.id,
                            song: item.song,
                            artist: item.artist,
                            index: index
                            })}>
                        {chordsInfo.section}
                    </span>
                )) : ""
            }
        </div>
    );
}