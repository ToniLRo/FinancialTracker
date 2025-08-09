package com.tonilr.FinancialTracker.Services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tonilr.FinancialTracker.Entities.Category;
import com.tonilr.FinancialTracker.exceptions.UserNotFoundException;
import com.tonilr.FinancialTracker.repos.CategoryRepo;

@Service
public class CategoryServices {

	@Autowired
	private final CategoryRepo categoryRepo;

	public CategoryServices(CategoryRepo categoryRepo) {
		this.categoryRepo = categoryRepo;
	}

	public Category addCategory(Category category) {
		return categoryRepo.save(category);
	}

	public List<Category> findAllCategories() {
		return categoryRepo.findAll();
	}

	public Category updateCategory(Category category) {
		return categoryRepo.save(category);
	}

	public Category findCategoryById(Long id) {
		return categoryRepo.findById(id)
				.orElseThrow(() -> new UserNotFoundException("Category by id " + id + " was not found"));

	}

	public void deleteCategory(Long id) {
		categoryRepo.deleteById(id);
	}
}
