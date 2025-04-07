package com.example.onlineBiddingSystem.service;

import com.example.onlineBiddingSystem.model.Item;
import com.example.onlineBiddingSystem.repo.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {
    @Autowired
    private ItemRepository repo;

    public Item addItem(Item item) {
        return repo.save(item);
    }

    public List<Item> getAllItems() {
        return repo.findAll();
    }

    public Item updateProduct(int id, Item item) {
        return repo.save(item);
    }

    public Item getItemById(int id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteItem(int id) {
        repo.deleteById(id);
    }
}
