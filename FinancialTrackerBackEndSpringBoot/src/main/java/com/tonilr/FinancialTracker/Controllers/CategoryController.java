package com.tonilr.FinancialTracker.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.tonilr.FinancialTracker.Entities.Category;
import com.tonilr.FinancialTracker.Services.CategoryServices;

@Controller
@RequestMapping("/category")
public class CategoryController {

	@Autowired
	private final CategoryServices categoryService;
	
	public CategoryController(CategoryServices categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Category>> getAllCategories() {
		List<Category> categories = categoryService.findAllCategories();
		return new ResponseEntity<>(categories, HttpStatus.OK);
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<Category> getCategoryById(@PathVariable("id") Long id) {
		Category category = categoryService.findCategoryById(id);
		return new ResponseEntity<>(category, HttpStatus.OK);
	}

	@PostMapping("/add")
	public ResponseEntity<Category> addCategory(@RequestBody Category category) {
		Category newCategory = categoryService.addCategory(category);
		return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
	}

	@PutMapping("/update")
	public ResponseEntity<Category> updateCategory(@RequestBody Category category) {
		Category updateCategory = categoryService.updateCategory(category);
		return new ResponseEntity<>(updateCategory, HttpStatus.OK);
	}
	


	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteCategory(@PathVariable("id") Long id) {
		categoryService.deleteCategory(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
