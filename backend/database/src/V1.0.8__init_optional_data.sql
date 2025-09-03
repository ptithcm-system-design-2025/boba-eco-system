-- ================================================================================================================
-- DỮ LIỆU TÙY CHỌN - DANH MỤC, SẢN PHẨM VÀ GIÁ (BOBA ECO SYSTEM)
-- ================================================================================================================

-- Thêm các danh mục mới cho các loại đồ uống
INSERT INTO category (name, description) VALUES
('TRÂN CHÂU ĐƯỜNG ĐEN', 'Các loại đồ uống kết hợp với trân châu đường đen, mang vị ngọt caramel đặc trưng.'),
('TRÀ SỮA', 'Danh mục tổng hợp các loại trà sữa truyền thống và phổ biến.'),
('TRÀ SỮA ĐẶC BIỆT', 'Các loại trà sữa cao cấp hoặc có công thức đặc biệt, mang hương vị độc đáo.'),
('MACCHIATO/KEM CHEESE', 'Các loại trà kết hợp với lớp kem macchiato hoặc kem cheese béo mịn.'),
('HOA HỒNG', 'Đồ uống có thành phần từ hoa hồng, mang hương thơm tự nhiên và thanh mát.'),
('TRÀ GIẢI KHÁT', 'Các loại trà thảo mộc và trà trái cây giúp giải nhiệt và tăng cường sức khỏe.'),
('TOPPING', 'Các loại topping đi kèm để tăng hương vị và trải nghiệm cho đồ uống.');

-- ================================================================================================================
-- THÊM SẢN PHẨM
-- ================================================================================================================

-- Sản phẩm thuộc danh mục: TRÂN CHÂU ĐƯỜNG ĐEN
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Sữa tươi trân châu đường đen', 'Một sự kết hợp hoàn hảo giữa vị ngọt thanh của đường đen và sự béo ngậy của sữa tươi nguyên chất. Điểm nhấn chính là những viên trân châu dai mềm, ngấm đều hương đường, tạo nên hương vị khó quên.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/milk_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Caramel trân châu đường đen', 'Đậm đà với lớp caramel mịn màng, hòa quyện cùng vị ngọt dịu của đường đen và trân châu dai mềm. Thức uống này mang lại cảm giác ngọt ngào, béo nhẹ, rất thích hợp cho những tín đồ hảo ngọt.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/caramel_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Socola trân châu đường đen', 'Hương vị thơm nồng, đậm đà của socola hòa quyện cùng đường đen ngọt thanh. Trân châu dẻo dai làm tăng thêm sự thú vị cho mỗi ngụm thưởng thức. Đây là lựa chọn lý tưởng cho những ai yêu thích sự đậm đà và ngọt ngào.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/socola_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Cacao trân châu đường đen', 'Một sự kết hợp tuyệt vời giữa vị đắng nhẹ của cacao nguyên chất và ngọt thanh của đường đen. Thức uống này vừa thơm vừa béo, mang lại cảm giác hài hòa và thư giãn.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/cacao_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Matcha trân châu đường đen', 'Matcha thanh mát, thơm lừng hòa quyện cùng lớp đường đen ngọt ngào và trân châu dai mềm. Sự hòa quyện này đem đến một trải nghiệm trà xanh hiện đại mà không kém phần truyền thống.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/matcha_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Khoai môn trân châu đường đen', 'Hương khoai môn tự nhiên, bùi bùi kết hợp cùng vị ngọt thanh của đường đen và trân châu dẻo dai. Một thức uống vừa thơm, vừa đậm vị quê nhà.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/khoaimon_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Hoa đậu biếc trân châu đường đen', 'Với sắc xanh bắt mắt từ hoa đậu biếc, kết hợp cùng vị ngọt nhẹ của đường đen và trân châu dẻo dai, đây không chỉ là thức uống ngon mà còn rất tốt cho sức khỏe.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hoadaubiec_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Oolong trân châu đường đen', 'Thưởng thức hương vị thanh tao, nhẹ nhàng của trà Oolong kết hợp cùng lớp đường đen ngọt dịu và trân châu mềm mại. Một sự lựa chọn lý tưởng để thư giãn và tận hưởng sự tinh tế.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/oolong_tcdd.png'),
((SELECT category_id FROM category WHERE name = 'TRÂN CHÂU ĐƯỜNG ĐEN'), 'Trà sữa trân châu đường đen', 'Kinh điển nhưng không bao giờ lỗi thời, trà sữa thơm ngon béo nhẹ hòa quyện cùng đường đen ngọt dịu và trân châu dai mềm. Thức uống này luôn là "must-try" cho bất kỳ ai yêu thích trà sữa.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/milk_tea_tcdd.png');

-- Sản phẩm thuộc danh mục: TRÀ SỮA
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa truyền thống', 'Hương vị quen thuộc với sự hòa quyện tinh tế giữa trà đen và sữa tươi. Vị ngọt vừa phải, thơm mát, thích hợp cho mọi lứa tuổi.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/truyenthong_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa socola', 'Đậm đà và ngọt ngào với hương socola thơm lừng, kết hợp cùng vị béo nhẹ của trà sữa.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/socola_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa caramel', 'Sự hòa quyện của trà sữa béo mịn và caramel thơm ngọt, mang lại cảm giác ấm áp, đầy mê hoặc.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/caramel_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa matcha', 'Matcha thanh mát, thơm phức, kết hợp cùng sữa ngọt dịu tạo nên hương vị cân bằng, thư thái.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/matcha_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa khoai môn', 'Vị bùi bùi đặc trưng của khoai môn hòa quyện cùng trà sữa béo ngậy, ngọt ngào và hấp dẫn.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/khoaimon_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa việt quốc', 'Độc đáo với hương thơm và vị chua ngọt nhẹ của việt quất, kết hợp trà sữa làm nổi bật vị giác.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/vietquoc_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa kiwi', 'Thức uống kết hợp giữa vị ngọt dịu của trà sữa và hương vị chua ngọt, tươi mát từ trái kiwi. Sự pha trộn độc đáo này mang lại cảm giác sảng khoái và đầy năng lượng, rất phù hợp cho những ngày hè.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/kiwi_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa đào', 'Ngọt thanh từ trái đào tươi, hòa quyện cùng trà sữa mát lạnh, mang lại cảm giác sảng khoái.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/dao_ts.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA'), 'Trà sữa đác', 'Vị trà sữa truyền thống thêm phần thú vị nhờ topping đác dai ngon, mát lạnh.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/dac_ts.png');

-- Sản phẩm thuộc danh mục: TRÀ SỮA ĐẶC BIỆT
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa The Way', 'Công thức độc quyền với hương vị đặc biệt, béo ngậy và thơm ngon, làm bạn phải say mê từ ngụm đầu tiên.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/theway_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Vani', 'Mùi hương vani dịu nhẹ, ngọt ngào, kết hợp trà sữa làm nên thức uống tinh tế và đầy cuốn hút.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/vani_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa mầm cây', 'Sự kết hợp sáng tạo với topping xanh mát từ thiên nhiên, vừa ngon miệng vừa tốt cho sức khỏe.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/mamcay_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa hạt dẻ', 'Hương vị hạt dẻ bùi bùi hòa quyện cùng trà sữa ngọt dịu, mang lại cảm giác ấm áp.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hatde_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Oolong', 'Thanh mát với hương trà oolong đậm đà, kết hợp cùng sữa ngọt dịu, làm nổi bật sự tinh tế.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/olong_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Hokaido', 'Đậm đà, béo ngậy với sữa Hokkaido thơm ngon, mang phong cách Nhật Bản đặc trưng.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hokaido_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa bánh Flan', 'Sự hòa quyện giữa vị ngọt béo của trà sữa và topping bánh flan mềm mịn, thơm ngon.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/traicay_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Kim cương Đen', 'Trân châu kim cương đen dẻo dai kết hợp trà sữa đậm đà, tạo nên sức hút khó cưỡng.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/plan_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa hoa đậu biếc', 'Màu xanh độc đáo từ hoa đậu biếc, hòa quyện trà sữa thanh mát, đẹp mắt và thơm ngon.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/blackdiamond_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa tứ quý mật ong', 'Sự kết hợp giữa bốn loại trà đặc biệt, thêm mật ong nguyên chất, mang lại vị thanh tao, ngọt dịu.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hoadaubiec_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa hạnh phúc', 'Công thức pha chế đặc biệt, mang lại cảm giác ngọt ngào và niềm vui cho mọi người.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/tuquymatong_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Matcha Pudding đậu đỏ', 'Matcha thơm lừng kết hợp pudding mịn màng và đậu đỏ bùi bùi, tạo nên thức uống hấp dẫn.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/happy_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa khoai môn Pudding đậu đỏ', 'Hương khoai môn tự nhiên cùng pudding mềm mịn và đậu đỏ, tăng thêm phần đặc sắc.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/matchapuddingdaudo_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Socola Cake Cream', 'Lớp kem bánh mềm mịn, thơm mát kết hợp socola đậm đà, tạo nên thức uống ngọt ngào khó quên.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/khoaimonpuddingdaudo_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'TRÀ SỮA ĐẶC BIỆT'), 'Trà sữa Matcha Cake Cream', 'Matcha thanh mát thêm phần lôi cuốn với lớp kem bánh béo ngậy, mang lại trải nghiệm đẳng cấp.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/socolacakecream_tsdb.png');

-- Sản phẩm thuộc danh mục: MACCHIATO/KEM CHEESE
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Hồng trà Machiato/Kem chese', 'Hồng trà đậm đà với lớp kem cheese mặn ngọt hài hòa, tạo nên một ly trà độc đáo.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/matchacakecream_tsdb.png'),
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Trà oolong Machiato/Kem chese', 'Trà oolong thanh tao kết hợp lớp kem béo ngậy, mang đến hương vị khó cưỡng.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hongtra_mkc.png'),
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Trà oolong đào Machiato/Kem chese', 'Vị đào thơm lừng hòa quyện cùng trà oolong và lớp kem cheese béo mịn.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/olong_mkc.png'),
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Trà gạo rang Machiato/Kem chese', 'Thơm lừng với vị trà gạo rang độc đáo, thêm kem cheese tạo nên một ly trà đậm đà, lạ miệng.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/olongdao_mkc.png'),
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Matcha Machiato/Kem chese', 'Vị trà xanh tươi mát kết hợp lớp kem cheese béo ngậy, làm nên thức uống đầy tinh tế.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/gaorang_mkc.png'),
((SELECT category_id FROM category WHERE name = 'MACCHIATO/KEM CHEESE'), 'Hoa đậu biếc Machiato/Kem chese', 'Màu sắc bắt mắt từ hoa đậu biếc và lớp kem cheese thơm ngon, là lựa chọn hoàn hảo cho người yêu cái đẹp.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/matcha_mkc.png');

-- Sản phẩm thuộc danh mục: HOA HỒNG
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Sữa tươi hoa hồng trân châu', 'Hương hoa hồng nhẹ nhàng kết hợp sữa tươi và trân châu dai mềm, mang lại cảm giác lãng mạn.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/hoadaubiec_mkc.png'),
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Sữa tươi hoa hồng nha đam', 'Sữa tươi béo nhẹ cùng nha đam giòn mát, thêm hương hoa hồng làm thức uống thêm phần đặc biệt.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/tranchau_sthh.png'),
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Trà hoa hồng Machiato', 'Trà hoa hồng thanh tao cùng lớp kem cheese ngậy béo, mang lại sự hài hòa độc đáo.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/nhadam_sthh.png'),
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Trà hoa hồng Galaxy', 'Sắc màu galaxy cuốn hút, cùng hương thơm hoa hồng ngọt ngào, tạo nên thức uống tinh tế.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/machiatotea_sthh.png'),
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Trà hoa hồng Lệ Chi', 'Hương vị thanh mát từ hoa hồng và trái vải tươi, mang đến cảm giác ngọt ngào, dễ chịu.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/galaxytea_sthh.png'),
((SELECT category_id FROM category WHERE name = 'HOA HỒNG'), 'Lục trà hoa hồng nha đam', 'Lục trà thanh mát kết hợp hương hoa hồng thơm dịu và nha đam giòn sật, là lựa chọn tuyệt vời cho ngày hè.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/lechitea_sthh.png');

-- Sản phẩm thuộc danh mục: TOPPING (Thạch)
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Thạch rau cau', null, true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/sixtea_sthh.jpg'),
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Thạch trái cây', null, true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/jelly_type.png'),
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Thạch cà phê', null, true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/jelly_type.png'),
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Nha đam', 'Giòn mát, tự nhiên và giàu dưỡng chất, phù hợp với hầu hết các loại thức uống.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/jelly_type.png');

-- Sản phẩm thuộc danh mục: TOPPING (Khác)
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Bánh Flan', 'Mềm mịn, béo ngậy, tăng thêm phần đặc sắc cho ly trà sữa.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/aloe_vera.png'),
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Kim cương đen', 'Trân châu đen cao cấp, dẻo thơm, ngấm vị ngọt đậm đà.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/flan.png'),
((SELECT category_id FROM category WHERE name = 'TOPPING'), 'Phô mai khổng lồ', 'Viên phô mai béo ngậy, tan chảy trong miệng, là lựa chọn tuyệt vời cho những tín đồ phô mai.', true, 'https://pub-6eff879fefb648ca96740b42eb728d1d.r2.dev/diamond_black.png');

-- ================================================================================================================
-- GIÁ SẢN PHẨM
-- ================================================================================================================

INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Sữa tươi trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Sữa tươi trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 40000, true),
((SELECT product_id FROM product WHERE name = 'Sữa tươi trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 45000, true),
-- Caramel trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Caramel trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Caramel trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Socola trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Socola trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Socola trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Cacao trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Cacao trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Cacao trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Matcha trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Matcha trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Matcha trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Khoai môn trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Khoai môn trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Khoai môn trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Hoa đậu biếc trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Hoa đậu biếc trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Hoa đậu biếc trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Oolong trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Oolong trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 35000, true),
((SELECT product_id FROM product WHERE name = 'Oolong trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 40000, true),
-- Trà sữa trân châu đường đen
((SELECT product_id FROM product WHERE name = 'Trà sữa trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 38000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa trân châu đường đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 40000, true),
-- Trà sữa truyền thống
((SELECT product_id FROM product WHERE name = 'Trà sữa truyền thống'), (SELECT size_id FROM product_size WHERE name = 'M'), 36000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa truyền thống'), (SELECT size_id FROM product_size WHERE name = 'L'), 42000, true),
-- Trà sữa socola
((SELECT product_id FROM product WHERE name = 'Trà sữa socola'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa socola'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa caramel
((SELECT product_id FROM product WHERE name = 'Trà sữa caramel'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa caramel'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa matcha
((SELECT product_id FROM product WHERE name = 'Trà sữa matcha'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa matcha'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa khoai môn
((SELECT product_id FROM product WHERE name = 'Trà sữa khoai môn'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa khoai môn'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa việt quốc
((SELECT product_id FROM product WHERE name = 'Trà sữa việt quốc'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa việt quốc'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa kiwi
((SELECT product_id FROM product WHERE name = 'Trà sữa kiwi'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa kiwi'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa đào
((SELECT product_id FROM product WHERE name = 'Trà sữa đào'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa đào'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa đác
((SELECT product_id FROM product WHERE name = 'Trà sữa đác'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa đác'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa The Way
((SELECT product_id FROM product WHERE name = 'Trà sữa The Way'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa The Way'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Vani
((SELECT product_id FROM product WHERE name = 'Trà sữa Vani'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Vani'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa mầm cây
((SELECT product_id FROM product WHERE name = 'Trà sữa mầm cây'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà sữa hạt dẻ
((SELECT product_id FROM product WHERE name = 'Trà sữa hạt dẻ'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa hạt dẻ'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Oolong
((SELECT product_id FROM product WHERE name = 'Trà sữa Oolong'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Oolong'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Hokaido
((SELECT product_id FROM product WHERE name = 'Trà sữa Hokaido'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Hokaido'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa bánh Flan
((SELECT product_id FROM product WHERE name = 'Trà sữa bánh Flan'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa bánh Flan'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Kim cương Đen
((SELECT product_id FROM product WHERE name = 'Trà sữa Kim cương Đen'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Kim cương Đen'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa hoa đậu biếc
((SELECT product_id FROM product WHERE name = 'Trà sữa hoa đậu biếc'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa hoa đậu biếc'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa tứ quý mật ong
((SELECT product_id FROM product WHERE name = 'Trà sữa tứ quý mật ong'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa tứ quý mật ong'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa hạnh phúc
((SELECT product_id FROM product WHERE name = 'Trà sữa hạnh phúc'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa hạnh phúc'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Matcha Pudding đậu đỏ
((SELECT product_id FROM product WHERE name = 'Trà sữa Matcha Pudding đậu đỏ'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Matcha Pudding đậu đỏ'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa khoai môn Pudding đậu đỏ
((SELECT product_id FROM product WHERE name = 'Trà sữa khoai môn Pudding đậu đỏ'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa khoai môn Pudding đậu đỏ'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Socola Cake Cream
((SELECT product_id FROM product WHERE name = 'Trà sữa Socola Cake Cream'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Socola Cake Cream'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Trà sữa Matcha Cake Cream
((SELECT product_id FROM product WHERE name = 'Trà sữa Matcha Cake Cream'), (SELECT size_id FROM product_size WHERE name = 'M'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Trà sữa Matcha Cake Cream'), (SELECT size_id FROM product_size WHERE name = 'L'), 50000, true),
-- Hồng trà Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Hồng trà Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà oolong Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Trà oolong Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà oolong đào Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Trà oolong đào Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà gạo rang Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Trà gạo rang Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Matcha Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Matcha Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Hoa đậu biếc Machiato/Kem chese
((SELECT product_id FROM product WHERE name = 'Hoa đậu biếc Machiato/Kem chese'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Sữa tươi hoa hồng trân châu
((SELECT product_id FROM product WHERE name = 'Sữa tươi hoa hồng trân châu'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Sữa tươi hoa hồng nha đam
((SELECT product_id FROM product WHERE name = 'Sữa tươi hoa hồng nha đam'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà hoa hồng Machiato
((SELECT product_id FROM product WHERE name = 'Trà hoa hồng Machiato'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà hoa hồng Galaxy
((SELECT product_id FROM product WHERE name = 'Trà hoa hồng Galaxy'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Trà hoa hồng Lệ Chi
((SELECT product_id FROM product WHERE name = 'Trà hoa hồng Lệ Chi'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Lục trà hoa hồng nha đam
((SELECT product_id FROM product WHERE name = 'Lục trà hoa hồng nha đam'), (SELECT size_id FROM product_size WHERE name = 'L'), 55000, true),
-- Thạch rau cau
((SELECT product_id FROM product WHERE name = 'Thạch rau cau'), (SELECT size_id FROM product_size WHERE name = 'NA'), 5000, true),
-- Thạch trái cây
((SELECT product_id FROM product WHERE name = 'Thạch trái cây'), (SELECT size_id FROM product_size WHERE name = 'NA'), 5000, true),
-- Thạch cà phê
((SELECT product_id FROM product WHERE name = 'Thạch cà phê'), (SELECT size_id FROM product_size WHERE name = 'NA'), 5000, true),
-- Nha đam
((SELECT product_id FROM product WHERE name = 'Nha đam'), (SELECT size_id FROM product_size WHERE name = 'NA'), 8000, true),
-- Bánh Flan
((SELECT product_id FROM product WHERE name = 'Bánh Flan'), (SELECT size_id FROM product_size WHERE name = 'NA'), 8000, true),
-- Kim cương đen
((SELECT product_id FROM product WHERE name = 'Kim cương đen'), (SELECT size_id FROM product_size WHERE name = 'NA'), 10000, true),
-- Phô mai khổng lồ
((SELECT product_id FROM product WHERE name = 'Phô mai khổng lồ'), (SELECT size_id FROM product_size WHERE name = 'NA'), 10000, true);
